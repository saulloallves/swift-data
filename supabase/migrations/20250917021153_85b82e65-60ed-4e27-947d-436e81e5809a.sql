-- FASE 1: Correções Críticas de Banco de Dados

-- 1. Adicionar constraint única no CPF
ALTER TABLE public.franqueados 
ADD CONSTRAINT franqueados_cpf_rnm_unique UNIQUE (cpf_rnm);

-- 2. Corrigir constraint de estacionamento - remover constraint problemática
ALTER TABLE public.unidades 
DROP CONSTRAINT IF EXISTS chk_partner_parking_address_when_flag;

-- 3. Adicionar valor padrão para systems_password (gerar número aleatório)
ALTER TABLE public.franqueados 
ALTER COLUMN systems_password SET DEFAULT floor(random() * 900000 + 100000)::bigint;

-- 4. Adicionar constraint única no CNPJ das unidades
ALTER TABLE public.unidades 
ADD CONSTRAINT unidades_cnpj_unique UNIQUE (cnpj);

-- 5. Adicionar constraint única no grupo_code das unidades  
ALTER TABLE public.unidades 
ADD CONSTRAINT unidades_group_code_unique UNIQUE (group_code);

-- 6. Criar nova constraint de estacionamento mais flexível
ALTER TABLE public.unidades
ADD CONSTRAINT chk_partner_parking_flexible 
CHECK (
  (has_partner_parking = false) OR 
  (has_partner_parking = true AND partner_parking_address IS NOT NULL AND partner_parking_address != '')
);