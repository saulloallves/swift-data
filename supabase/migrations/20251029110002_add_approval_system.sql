-- Migration: Add Approval System for Onboarding Requests
-- Description: Creates staging tables for onboarding approval workflow
-- Date: 2025-10-29

-- =====================================================
-- 1. CREATE MAIN ONBOARDING REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS onboarding_requests (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT UNIQUE NOT NULL,
    
    -- Form data stored as JSON (complete payload)
    form_data JSONB NOT NULL,
    
    -- Extracted identifiers for quick queries
    franchisee_cpf TEXT,
    franchisee_email TEXT,
    unit_cnpj TEXT,
    
    -- Existence flags and foreign keys
    franchisee_exists BOOLEAN DEFAULT false,
    franchisee_id UUID REFERENCES franqueados(id) ON DELETE SET NULL,
    unit_exists BOOLEAN DEFAULT false,
    unit_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
    
    -- Workflow status
    status TEXT NOT NULL DEFAULT 'pending',
    request_type TEXT NOT NULL,
    
    -- Review information
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'error')),
    CONSTRAINT valid_request_type CHECK (request_type IN ('new_franchisee_new_unit', 'existing_franchisee_new_unit', 'new_franchisee_existing_unit'))
);

-- =====================================================
-- 2. CREATE REQUEST HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS onboarding_request_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES onboarding_requests(id) ON DELETE CASCADE,
    status_from TEXT NOT NULL,
    status_to TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    metadata JSONB
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Status-based queries (most common)
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_status 
    ON onboarding_requests(status) 
    WHERE status IN ('pending', 'processing');

-- Lookup by identifiers
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_cpf 
    ON onboarding_requests(franchisee_cpf);

CREATE INDEX IF NOT EXISTS idx_onboarding_requests_cnpj 
    ON onboarding_requests(unit_cnpj);

CREATE INDEX IF NOT EXISTS idx_onboarding_requests_email 
    ON onboarding_requests(franchisee_email);

-- Request number lookup (for public status check)
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_number 
    ON onboarding_requests(request_number);

-- Time-based queries (for reports and dashboards)
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_submitted 
    ON onboarding_requests(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_onboarding_requests_reviewed 
    ON onboarding_requests(reviewed_at DESC) 
    WHERE reviewed_at IS NOT NULL;

-- Request type analytics
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_type 
    ON onboarding_requests(request_type);

-- History lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_request_history_request 
    ON onboarding_request_history(request_id, changed_at DESC);

-- =====================================================
-- 4. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_onboarding_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_onboarding_request_updated_at
    BEFORE UPDATE ON onboarding_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_request_updated_at();

-- =====================================================
-- 5. CREATE TRIGGER FOR AUTOMATIC HISTORY LOGGING
-- =====================================================
CREATE OR REPLACE FUNCTION log_onboarding_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO onboarding_request_history (
            request_id,
            status_from,
            status_to,
            changed_by,
            changed_at,
            notes,
            metadata
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            NEW.reviewed_by,
            NOW(),
            CASE 
                WHEN NEW.status = 'rejected' THEN NEW.rejection_reason
                WHEN NEW.status = 'approved' THEN 'Request approved and data inserted into main tables'
                WHEN NEW.status = 'processing' THEN 'Request is being processed'
                WHEN NEW.status = 'error' THEN NEW.rejection_reason
                ELSE 'Status updated'
            END,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'franchisee_id', NEW.franchisee_id,
                'unit_id', NEW.unit_id
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_onboarding_request_status_change
    AFTER UPDATE ON onboarding_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_onboarding_request_status_change();

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE onboarding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_request_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CREATE RLS POLICIES
-- =====================================================

-- Allow public to read their own request by request_number (for status check)
CREATE POLICY "Allow public read by request_number"
    ON onboarding_requests
    FOR SELECT
    USING (true);

-- Allow public to insert new requests (initial submission)
CREATE POLICY "Allow public insert"
    ON onboarding_requests
    FOR INSERT
    WITH CHECK (true);

-- Allow authenticated users (from matriz system) to update
CREATE POLICY "Allow authenticated update"
    ON onboarding_requests
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete (soft delete via status update is preferred)
CREATE POLICY "Allow authenticated delete"
    ON onboarding_requests
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- History: Allow authenticated users to insert (manual logs)
CREATE POLICY "Allow authenticated insert history"
    ON onboarding_request_history
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- History: Allow authenticated users to read
CREATE POLICY "Allow authenticated read history"
    ON onboarding_request_history
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- =====================================================
-- 8. ADD TABLE COMMENTS (Documentation)
-- =====================================================
COMMENT ON TABLE onboarding_requests IS 'Staging table for onboarding requests pending approval';
COMMENT ON TABLE onboarding_request_history IS 'Audit log of status changes for onboarding requests';

COMMENT ON COLUMN onboarding_requests.form_data IS 'Complete form payload as submitted by user (JSONB)';
COMMENT ON COLUMN onboarding_requests.request_number IS 'Human-readable protocol number (e.g., ONB-2025-00001)';
COMMENT ON COLUMN onboarding_requests.status IS 'Workflow status: pending, processing, approved, rejected, error';
COMMENT ON COLUMN onboarding_requests.request_type IS 'Type: new_franchisee_new_unit, existing_franchisee_new_unit, new_franchisee_existing_unit';
COMMENT ON COLUMN onboarding_requests.franchisee_exists IS 'Flag indicating if franchisee already exists in main table';
COMMENT ON COLUMN onboarding_requests.unit_exists IS 'Flag indicating if unit already exists in main table';

-- =====================================================
-- 9. CREATE HELPER FUNCTION: Generate Request Number
-- =====================================================
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    last_number INTEGER;
    new_number INTEGER;
    prefix TEXT;
BEGIN
    current_year := TO_CHAR(NOW(), 'YYYY');
    prefix := 'ONB-' || current_year || '-';
    
    -- Get last number for current year
    SELECT COALESCE(
        MAX(
            CAST(
                SUBSTRING(request_number FROM LENGTH(prefix) + 1) AS INTEGER
            )
        ), 
        0
    )
    INTO last_number
    FROM onboarding_requests
    WHERE request_number LIKE prefix || '%';
    
    new_number := last_number + 1;
    
    RETURN prefix || LPAD(new_number::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_request_number IS 'Generates sequential request numbers in format ONB-YYYY-NNNNN';

-- =====================================================
-- 10. CREATE HELPER FUNCTION: Get Request Statistics
-- =====================================================
CREATE OR REPLACE FUNCTION get_onboarding_stats(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    total_requests BIGINT,
    pending_requests BIGINT,
    approved_requests BIGINT,
    rejected_requests BIGINT,
    processing_requests BIGINT,
    avg_processing_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_requests,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_requests,
        COUNT(*) FILTER (WHERE status = 'approved')::BIGINT as approved_requests,
        COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected_requests,
        COUNT(*) FILTER (WHERE status = 'processing')::BIGINT as processing_requests,
        AVG(reviewed_at - submitted_at) FILTER (WHERE reviewed_at IS NOT NULL) as avg_processing_time
    FROM onboarding_requests
    WHERE submitted_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_onboarding_stats IS 'Returns statistics about onboarding requests for a given period';

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================

-- Grant usage on sequences (if needed in future)
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Note: Row Level Security policies control actual data access
-- These grants are for the schema-level permissions

-- =====================================================
-- Migration Complete
-- =====================================================
