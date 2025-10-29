import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função auxiliar para limpar telefone (apenas números)
function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

// Função para gerar número de protocolo
async function generateRequestNumber(supabaseAdmin: any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ONB-${year}-`;
  
  // Buscar último número do ano
  const { data: lastRequest } = await supabaseAdmin
    .from('onboarding_requests')
    .select('request_number')
    .like('request_number', `${prefix}%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  let nextNumber = 1;
  if (lastRequest) {
    const lastNumber = parseInt(lastRequest.request_number.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
}

// Função para extrair IP do request
function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET') {
    console.log('🏥 Health check requested');
    return new Response(JSON.stringify({
      status: 'healthy',
      function: 'onboarding-submit',
      timestamp: new Date().toISOString(),
      environment: {
        hasServiceRole: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL')
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    console.log('🚀 Iniciando onboarding-submit');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Cliente com Service Role para bypass de RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { action, formData } = await req.json();
    console.log('📥 Ação recebida:', action);

    // ==================== SUBMIT FORM ====================
    if (action === 'submitForm') {
      console.log('📝 Processando submitForm com sistema de aprovação');
      
      // Validações básicas
      if (!formData.cpf_rnm || !formData.full_name) {
        console.error('❌ Validação falhou: CPF ou nome completo ausente');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'CPF e nome completo são obrigatórios' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fluxo normal - validar código de unidade
      if (formData.group_code) {
        console.log('🔍 Validando código de unidade:', formData.group_code);
        const { data: unitExists, error } = await supabaseAdmin
          .from('unidades_old')
          .select('group_code')
          .eq('group_code', formData.group_code)
          .maybeSingle();

        if (error) {
          console.error('❌ Erro ao validar código da unidade:', error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Erro ao validar código da unidade' 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!unitExists) {
          console.error('❌ Código de unidade inválido:', formData.group_code);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Código de unidade inválido. Selecione uma unidade válida da lista de sugestões.' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('✅ Código de unidade validado');
      }

      if (!formData.group_code || formData.group_code <= 0) {
        console.error('❌ Código do grupo inválido');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Código do grupo é obrigatório e deve ser maior que 0' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validar estacionamento parceiro
      if (formData.has_partner_parking && !formData.partner_parking_address) {
        console.error('❌ Endereço do estacionamento parceiro ausente');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Endereço do estacionamento parceiro é obrigatório quando estacionamento parceiro está habilitado' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validar termos
      if (!formData.system_term_accepted || !formData.confidentiality_term_accepted || !formData.lgpd_term_accepted) {
        console.error('❌ Termos não aceitos');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Todos os termos devem ser aceitos' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ===== INÍCIO DO SISTEMA DE APROVAÇÃO =====
      
      // 1. Verificar se franqueado existe (CPF)
      console.log('🔍 Verificando se franqueado já existe...');
      const { data: existingFranchisee } = await supabaseAdmin
        .from('franqueados')
        .select('id, cpf_rnm, full_name, email')
        .eq('cpf_rnm', formData.cpf_rnm)
        .maybeSingle();
      
      // 2. Verificar se unidade existe (group_code)
      console.log('🔍 Verificando se unidade já existe...');
      const { data: existingUnit } = await supabaseAdmin
        .from('unidades')
        .select('id, group_code, group_name, cnpj')
        .eq('group_code', formData.group_code)
        .maybeSingle();
      
      // 3. Verificar duplicidade em requests pendentes
      console.log('🔍 Verificando requests pendentes duplicados...');
      const { data: pendingDuplicate } = await supabaseAdmin
        .from('onboarding_requests')
        .select('id, request_number, status')
        .or(`franchisee_cpf.eq.${formData.cpf_rnm},unit_cnpj.eq.${formData.group_code}`)
        .in('status', ['pending', 'processing'])
        .limit(1)
        .maybeSingle();
      
      if (pendingDuplicate) {
        console.log('⚠️ Request pendente duplicado encontrado:', pendingDuplicate.request_number);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Já existe um cadastro pendente com estes dados',
            existingRequest: pendingDuplicate.request_number,
            status: pendingDuplicate.status
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // 4. Determinar tipo de request
      let requestType: string;
      if (!existingFranchisee && !existingUnit) {
        requestType = 'new_franchisee_new_unit';
        console.log('📋 Tipo de cadastro: Novo franqueado + Nova unidade');
      } else if (existingFranchisee && !existingUnit) {
        requestType = 'existing_franchisee_new_unit';
        console.log('📋 Tipo de cadastro: Franqueado existente + Nova unidade');
      } else if (!existingFranchisee && existingUnit) {
        requestType = 'new_franchisee_existing_unit';
        console.log('📋 Tipo de cadastro: Novo franqueado + Unidade existente');
      } else {
        // Ambos existem - verificar se já estão vinculados
        console.log('� Franqueado e unidade já existem. Verificando vinculação...');
        const { data: existingRelation } = await supabaseAdmin
          .from('franqueados_unidades')
          .select('id')
          .eq('franqueado_id', existingFranchisee.id)
          .eq('unidade_id', existingUnit.id)
          .maybeSingle();
        
        if (existingRelation) {
          console.log('❌ Franqueado já vinculado a esta unidade');
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Franqueado já está vinculado a esta unidade',
              franchiseeId: existingFranchisee.id,
              unitId: existingUnit.id
            }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Se não estão vinculados, criar request para vinculação
        requestType = 'existing_franchisee_new_unit';
        console.log('� Tipo de cadastro: Vinculação de franqueado existente a unidade existente');
      }
      
      // 5. Gerar número de protocolo
      console.log('🔢 Gerando número de protocolo...');
      const requestNumber = await generateRequestNumber(supabaseAdmin);
      console.log('✅ Protocolo gerado:', requestNumber);
      
      // 6. Preparar dados completos do formulário
      const completeFormData = {
        ...formData,
        contact: cleanPhoneNumber(formData.contact),
      };
      
      // 7. Inserir request na tabela de aprovação
      console.log('� Criando request de aprovação...');
      const { data: newRequest, error: insertError } = await supabaseAdmin
        .from('onboarding_requests')
        .insert({
          request_number: requestNumber,
          form_data: completeFormData,
          franchisee_cpf: formData.cpf_rnm,
          franchisee_email: formData.franchisee_email || null,
          unit_cnpj: formData.group_code.toString(),
          franchisee_exists: !!existingFranchisee,
          franchisee_id: existingFranchisee?.id || null,
          unit_exists: !!existingUnit,
          unit_id: existingUnit?.id || null,
          status: 'pending',
          request_type: requestType,
          ip_address: getClientIP(req),
          user_agent: req.headers.get('user-agent') || null
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Erro ao criar request:', insertError);
        throw insertError;
      }
      
      console.log('✅ Request criado com sucesso! ID:', newRequest.id);
      
      // 8. Retornar sucesso com número de protocolo
      console.log('🎉 Cadastro enviado para aprovação com sucesso!');
      return new Response(
        JSON.stringify({ 
          success: true,
          requestId: newRequest.id,
          requestNumber: requestNumber,
          requestType: requestType,
          message: 'Cadastro enviado para aprovação com sucesso!',
          needsApproval: true,
          estimatedTime: '2 dias úteis'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== SUBMIT NEW UNIT ====================
    if (action === 'submitNewUnit') {
      console.log('📝 Processando submitNewUnit com sistema de aprovação');
      
      if (!formData.franchiseeId) {
        console.error('❌ ID do franqueado ausente');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'ID do franqueado não encontrado' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!formData.group_code || formData.group_code <= 0) {
        console.error('❌ Código do grupo inválido');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Código do grupo é obrigatório e deve ser maior que 0' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validar código de unidade
      console.log('🔍 Validando código de unidade:', formData.group_code);
      const { data: unitExists, error } = await supabaseAdmin
        .from('unidades_old')
        .select('group_code')
        .eq('group_code', formData.group_code)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao validar código da unidade:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Erro ao validar código da unidade' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!unitExists) {
        console.error('❌ Código de unidade inválido:', formData.group_code);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Código de unidade inválido. Selecione uma unidade válida da lista de sugestões.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Código de unidade validado');

      // Validar estacionamento parceiro
      if (formData.has_partner_parking && !formData.partner_parking_address) {
        console.error('❌ Endereço do estacionamento parceiro ausente');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Endereço do estacionamento parceiro é obrigatório quando estacionamento parceiro está habilitado' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ===== SISTEMA DE APROVAÇÃO PARA NOVA UNIDADE =====
      
      // Verificar se unidade já existe no banco principal
      console.log('🔍 Verificando se unidade já existe...');
      const { data: existingUnit } = await supabaseAdmin
        .from('unidades')
        .select('id, group_code')
        .eq('group_code', formData.group_code)
        .maybeSingle();
      
      // Verificar requests pendentes
      const { data: pendingDuplicate } = await supabaseAdmin
        .from('onboarding_requests')
        .select('id, request_number, status')
        .eq('unit_cnpj', formData.group_code.toString())
        .in('status', ['pending', 'processing'])
        .limit(1)
        .maybeSingle();
      
      if (pendingDuplicate) {
        console.log('⚠️ Request pendente duplicado encontrado');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Já existe um cadastro pendente para esta unidade',
            existingRequest: pendingDuplicate.request_number
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Gerar protocolo
      const requestNumber = await generateRequestNumber(supabaseAdmin);
      console.log('✅ Protocolo gerado:', requestNumber);
      
      // Preparar dados
      const completeFormData = {
        ...formData,
        franchiseeId: formData.franchiseeId,
      };
      
      // Criar request
      const { data: newRequest, error: insertError } = await supabaseAdmin
        .from('onboarding_requests')
        .insert({
          request_number: requestNumber,
          form_data: completeFormData,
          franchisee_cpf: null,
          franchisee_email: null,
          unit_cnpj: formData.group_code.toString(),
          franchisee_exists: true,
          franchisee_id: formData.franchiseeId,
          unit_exists: !!existingUnit,
          unit_id: existingUnit?.id || null,
          status: 'pending',
          request_type: 'existing_franchisee_new_unit',
          ip_address: getClientIP(req),
          user_agent: req.headers.get('user-agent') || null
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Erro ao criar request:', insertError);
        throw insertError;
      }
      
      console.log('✅ Request de nova unidade criado com sucesso!');
      
      return new Response(
        JSON.stringify({ 
          success: true,
          requestId: newRequest.id,
          requestNumber: requestNumber,
          requestType: 'existing_franchisee_new_unit',
          message: 'Nova unidade enviada para aprovação com sucesso!',
          needsApproval: true,
          estimatedTime: '2 dias úteis'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ação não reconhecida
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Ação não reconhecida' 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro inesperado na Edge Function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro inesperado ao processar requisição' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
