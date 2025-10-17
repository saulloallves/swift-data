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
      console.log('📝 Processando submitForm');
      
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

      // Verificar se é vinculação de unidade existente
      if (formData._linking_existing_unit && formData._existing_unit_id) {
        console.log('🔗 Fluxo de vinculação de unidade existente detectado');
        console.log('🎯 Unit ID:', formData._existing_unit_id);
        
        // Chamar lógica de linkExistingUnit
        const franchiseeData = {
          cpf_rnm: formData.cpf_rnm,
          full_name: formData.full_name,
          birth_date: formData.birth_date || null,
          email: formData.franchisee_email || null,
          contact: cleanPhoneNumber(formData.contact),
          nationality: formData.nationality || null,
          owner_type: formData.owner_type,
          education: formData.education || null,
          previous_profession: formData.previous_profession || null,
          previous_salary_range: formData.previous_salary_range || null,
          was_entrepreneur: formData.was_entrepreneur,
          availability: formData.availability || null,
          discovery_source: formData.discovery_source || null,
          was_referred: formData.was_referred,
          referrer_name: formData.referrer_name || null,
          referrer_unit_code: formData.referrer_unit_code || null,
          has_other_activities: formData.has_other_activities,
          other_activities_description: formData.other_activities_description || null,
          receives_prolabore: formData.receives_prolabore,
          prolabore_value: formData.prolabore_value || null,
          profile_image: formData.profile_image || null,
          instagram: formData.instagram || null,
          address: formData.franchisee_address || null,
          number_address: formData.franchisee_number_address || null,
          address_complement: formData.franchisee_address_complement || null,
          neighborhood: formData.franchisee_neighborhood || null,
          city: formData.franchisee_city || null,
          state: formData.franchisee_state || null,
          uf: formData.franchisee_uf || null,
          postal_code: formData.franchisee_postal_code || null,
          lgpd_term_accepted: true,
          confidentiality_term_accepted: true,
          system_term_accepted: true,
        };

        const franchiseeResult = await supabaseAdmin
          .from('franqueados')
          .upsert(franchiseeData, { onConflict: 'cpf_rnm' })
          .select('id')
          .single();

        if (franchiseeResult.error) {
          console.error('❌ Erro ao salvar franqueado:', franchiseeResult.error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Erro ao salvar dados do franqueado: ${franchiseeResult.error.message}` 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const franchiseeId = franchiseeResult.data.id;
        console.log('✅ Franqueado salvo com ID:', franchiseeId);

        // Verificar se já existe vinculação
        const { data: existingRelation } = await supabaseAdmin
          .from('franqueados_unidades')
          .select('id')
          .eq('unidade_id', formData._existing_unit_id)
          .eq('franqueado_id', franchiseeId)
          .maybeSingle();

        if (existingRelation) {
          console.log('⚠️ Franqueado já vinculado a esta unidade');
          return new Response(
            JSON.stringify({ 
              success: true, 
              franchiseeId,
              message: 'Franqueado já vinculado a esta unidade' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Criar vinculação
        const { error: insertError } = await supabaseAdmin
          .from('franqueados_unidades')
          .insert({ 
            franqueado_id: franchiseeId, 
            unidade_id: formData._existing_unit_id 
          });

        if (insertError) {
          console.error('❌ Erro ao criar vinculação:', insertError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Erro ao vincular franqueado à unidade: ${insertError.message}` 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('✅ Vinculação criada com sucesso');
        return new Response(
          JSON.stringify({ 
            success: true, 
            franchiseeId,
            message: 'Franqueado vinculado à unidade com sucesso' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

      // Preparar dados do franqueado
      const franchiseeData = {
        cpf_rnm: formData.cpf_rnm,
        full_name: formData.full_name,
        birth_date: formData.birth_date || null,
        email: formData.franchisee_email || null,
        contact: cleanPhoneNumber(formData.contact),
        nationality: formData.nationality || null,
        owner_type: formData.owner_type,
        education: formData.education || null,
        previous_profession: formData.previous_profession || null,
        previous_salary_range: formData.previous_salary_range || null,
        was_entrepreneur: formData.was_entrepreneur,
        availability: formData.availability || null,
        discovery_source: formData.discovery_source || null,
        was_referred: formData.was_referred,
        referrer_name: formData.referrer_name || null,
        referrer_unit_code: formData.referrer_unit_code || null,
        has_other_activities: formData.has_other_activities,
        other_activities_description: formData.other_activities_description || null,
        receives_prolabore: formData.receives_prolabore,
        prolabore_value: formData.prolabore_value || null,
        profile_image: formData.profile_image || null,
        instagram: formData.instagram || null,
        address: formData.franchisee_address || null,
        number_address: formData.franchisee_number_address || null,
        address_complement: formData.franchisee_address_complement || null,
        neighborhood: formData.franchisee_neighborhood || null,
        city: formData.franchisee_city || null,
        state: formData.franchisee_state || null,
        uf: formData.franchisee_uf || null,
        postal_code: formData.franchisee_postal_code || null,
        system_term_accepted: formData.system_term_accepted,
        confidentiality_term_accepted: formData.confidentiality_term_accepted,
        lgpd_term_accepted: formData.lgpd_term_accepted,
        is_in_contract: false,
        is_active_system: true,
      };

      // Preparar dados da unidade
      const unitData = {
        cnpj: formData.cnpj || null,
        fantasy_name: formData.fantasy_name || null,
        group_name: formData.group_name,
        group_code: formData.group_code,
        store_model: formData.store_model,
        store_phase: formData.store_phase,
        store_imp_phase: formData.store_imp_phase || null,
        email: formData.email || null,
        phone: formData.phone || null,
        instagram_profile: formData.instagram_profile || null,
        has_parking: formData.has_parking,
        parking_spots: formData.parking_spots || null,
        has_partner_parking: formData.has_partner_parking,
        partner_parking_address: formData.has_partner_parking ? formData.partner_parking_address : null,
        purchases_active: formData.purchases_active,
        sales_active: formData.sales_active,
        address: formData.unit_address || null,
        number_address: formData.unit_number_address || null,
        address_complement: formData.unit_address_complement || null,
        neighborhood: formData.unit_neighborhood || null,
        city: formData.unit_city || null,
        state: formData.unit_state || null,
        uf: formData.unit_uf || null,
        postal_code: formData.unit_postal_code || null,
        operation_mon: formData.operation_mon || null,
        operation_tue: formData.operation_tue || null,
        operation_wed: formData.operation_wed || null,
        operation_thu: formData.operation_thu || null,
        operation_fri: formData.operation_fri || null,
        operation_sat: formData.operation_sat || null,
        operation_sun: formData.operation_sun || null,
        operation_hol: formData.operation_hol || null,
        is_active: true,
      };

      console.log('💾 Salvando franqueado...');
      const franchiseeResult = await supabaseAdmin
        .from('franqueados')
        .upsert(franchiseeData, { onConflict: 'cpf_rnm' })
        .select('id')
        .single();

      if (franchiseeResult.error) {
        console.error('❌ Erro ao salvar franqueado:', franchiseeResult.error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Erro ao salvar dados do franqueado: ${franchiseeResult.error.message}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const franchiseeId = franchiseeResult.data.id;
      console.log('✅ Franqueado salvo com ID:', franchiseeId);

      console.log('💾 Salvando unidade...');
      const unitResult = await supabaseAdmin
        .from('unidades')
        .upsert(unitData, { onConflict: 'group_code' })
        .select('id')
        .single();

      if (unitResult.error) {
        console.error('❌ Erro ao salvar unidade:', unitResult.error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Erro ao salvar dados da unidade: ${unitResult.error.message}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const unitId = unitResult.data.id;
      console.log('✅ Unidade salva com ID:', unitId);

      console.log('🔗 Criando vinculação franqueado-unidade...');
      const relationshipResult = await supabaseAdmin
        .from('franqueados_unidades')
        .insert({ 
          franqueado_id: franchiseeId, 
          unidade_id: unitId 
        });

      if (relationshipResult.error) {
        console.error('❌ Erro ao criar vinculação:', relationshipResult.error);
        // Se o relacionamento já existe, não é erro crítico
        if (relationshipResult.error.code !== '23505') {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Erro ao criar vínculo franqueado-unidade: ${relationshipResult.error.message}` 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      console.log('✅ Vinculação criada com sucesso');
      console.log('🎉 Cadastro completo!');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          franchiseeId,
          unitId,
          message: 'Cadastro realizado com sucesso' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== SUBMIT NEW UNIT ====================
    if (action === 'submitNewUnit') {
      console.log('📝 Processando submitNewUnit');
      
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

      // Preparar dados da unidade
      const unitData = {
        cnpj: formData.cnpj || null,
        fantasy_name: formData.fantasy_name || null,
        group_name: formData.group_name,
        group_code: formData.group_code,
        store_model: formData.store_model,
        store_phase: formData.store_phase,
        store_imp_phase: formData.store_imp_phase || null,
        email: formData.email || null,
        phone: formData.phone || null,
        instagram_profile: formData.instagram_profile || null,
        has_parking: formData.has_parking,
        parking_spots: formData.parking_spots || null,
        has_partner_parking: formData.has_partner_parking,
        partner_parking_address: formData.has_partner_parking ? formData.partner_parking_address : null,
        purchases_active: formData.purchases_active,
        sales_active: formData.sales_active,
        address: formData.unit_address || null,
        number_address: formData.unit_number_address || null,
        address_complement: formData.unit_address_complement || null,
        neighborhood: formData.unit_neighborhood || null,
        city: formData.unit_city || null,
        state: formData.unit_state || null,
        uf: formData.unit_uf || null,
        postal_code: formData.unit_postal_code || null,
        operation_mon: formData.operation_mon || null,
        operation_tue: formData.operation_tue || null,
        operation_wed: formData.operation_wed || null,
        operation_thu: formData.operation_thu || null,
        operation_fri: formData.operation_fri || null,
        operation_sat: formData.operation_sat || null,
        operation_sun: formData.operation_sun || null,
        operation_hol: formData.operation_hol || null,
        is_active: true,
      };

      console.log('💾 Salvando nova unidade...');
      const unitResult = await supabaseAdmin
        .from('unidades')
        .upsert(unitData, { onConflict: 'group_code' })
        .select('id')
        .single();

      if (unitResult.error) {
        console.error('❌ Erro ao salvar unidade:', unitResult.error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Erro ao salvar dados da unidade: ${unitResult.error.message}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const unitId = unitResult.data.id;
      console.log('✅ Unidade salva com ID:', unitId);

      console.log('🔗 Criando vinculação franqueado-unidade...');
      const relationshipResult = await supabaseAdmin
        .from('franqueados_unidades')
        .insert({ 
          franqueado_id: formData.franchiseeId, 
          unidade_id: unitId 
        });

      if (relationshipResult.error) {
        console.error('❌ Erro ao criar vinculação:', relationshipResult.error);
        // Se o relacionamento já existe, não é erro crítico
        if (relationshipResult.error.code !== '23505') {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Erro ao criar vínculo franqueado-unidade: ${relationshipResult.error.message}` 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      console.log('✅ Vinculação criada com sucesso');
      console.log('🎉 Nova unidade cadastrada!');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          unitId,
          message: 'Nova unidade cadastrada com sucesso' 
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
