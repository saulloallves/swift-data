import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cleanPhoneNumber } from "@/lib/utils";

export interface OnboardingFormData {
  // Franchisee data
  cpf_rnm: string;
  full_name: string;
  birth_date: string;
  franchisee_email: string;
  contact: string;
  nationality: string;
  owner_type: string;
  education: string;
  previous_profession: string;
  previous_salary_range: string;
  was_entrepreneur: boolean;
  availability: string;
  discovery_source: string;
  was_referred: boolean;
  referrer_name: string;
  referrer_unit_code: string;
  has_other_activities: boolean;
  other_activities_description: string;
  receives_prolabore: boolean;
  prolabore_value: number;
  profile_image: string;
  instagram: string;

  // Flags para controle de fluxo
  _linking_existing_unit?: boolean;
  _existing_unit_id?: string;
  
  // Franchisee address data
  franchisee_postal_code: string;
  franchisee_address: string;
  franchisee_number_address: string;
  franchisee_address_complement: string;
  has_complement: boolean;
  franchisee_neighborhood: string;
  franchisee_city: string;
  franchisee_state: string;
  franchisee_uf: string;
  
  // Unit address data
  unit_postal_code: string;
  unit_address: string;
  unit_number_address: string;
  unit_address_complement: string;
  has_unit_complement: boolean;
  unit_neighborhood: string;
  unit_city: string;
  unit_state: string;
  unit_uf: string;
  
  // Unit data
  cnpj: string;
  fantasy_name: string;
  group_name: string;
  group_code: number;
  store_model: string;
  store_phase: string;
  store_imp_phase: string;
  email: string;
  phone: string;
  instagram_profile: string;
  has_parking: boolean;
  parking_spots: number;
  has_partner_parking: boolean;
  partner_parking_address: string;
  purchases_active: boolean;
  sales_active: boolean;
  
  // Operation hours
  operation_mon: string;
  operation_tue: string;
  operation_wed: string;
  operation_thu: string;
  operation_fri: string;
  operation_sat: string;
  operation_sun: string;
  operation_hol: string;
  
  // Terms
  system_term_accepted: boolean;
  confidentiality_term_accepted: boolean;
  lgpd_term_accepted: boolean;
}

const initialFormData: OnboardingFormData = {
  cpf_rnm: "",
  full_name: "",
  birth_date: "",
  franchisee_email: "",
  contact: "",
  nationality: "",
  owner_type: "Pessoa Física",
  education: "",
  previous_profession: "",
  previous_salary_range: "",
  was_entrepreneur: false,
  availability: "",
  discovery_source: "",
  was_referred: false,
  referrer_name: "",
  referrer_unit_code: "",
  has_other_activities: false,
  other_activities_description: "",
  receives_prolabore: false,
  prolabore_value: 0,
  profile_image: "",
  instagram: "",
  _linking_existing_unit: false,
  _existing_unit_id: "",
  franchisee_postal_code: "",
  franchisee_address: "",
  franchisee_number_address: "",
  franchisee_address_complement: "",
  has_complement: false,
  franchisee_neighborhood: "",
  franchisee_city: "",
  franchisee_state: "",
  franchisee_uf: "",
  unit_postal_code: "",
  unit_address: "",
  unit_number_address: "",
  unit_address_complement: "",
  has_unit_complement: false,
  unit_neighborhood: "",
  unit_city: "",
  unit_state: "",
  unit_uf: "",
  cnpj: "",
  fantasy_name: "",
  group_name: "",
  group_code: 0,
  store_model: "",
  store_phase: "operacao",
  store_imp_phase: "integracao",
  email: "",
  phone: "",
  instagram_profile: "",
  has_parking: false,
  parking_spots: 0,
  has_partner_parking: false,
  partner_parking_address: "",
  purchases_active: true, // true por padrão pois store_phase inicial é "operacao"
  sales_active: true, // true por padrão pois store_phase inicial é "operacao"
  operation_mon: "",
  operation_tue: "",
  operation_wed: "",
  operation_thu: "",
  operation_fri: "",
  operation_sat: "",
  operation_sun: "",
  operation_hol: "",
  system_term_accepted: false,
  confidentiality_term_accepted: false,
  lgpd_term_accepted: false,
};

export const useOnboardingForm = () => {
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [franchiseeId, setFranchiseeId] = useState<string | null>(null);
  const [existingFranchiseeId, setExistingFranchiseeId] = useState<string | null>(null);

  const updateFormData = (updates: Partial<OnboardingFormData> | OnboardingFormData) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetUnitData = () => {
    setFormData(prev => ({
      ...prev,
      // Reset unit address data
      unit_postal_code: "",
      unit_address: "",
      unit_number_address: "",
      unit_address_complement: "",
      has_unit_complement: false,
      unit_neighborhood: "",
      unit_city: "",
      unit_state: "",
      unit_uf: "",
      // Reset unit data
      cnpj: "",
      fantasy_name: "",
      group_name: "",
      group_code: 0,
      store_model: "",
      store_phase: "operacao",
      store_imp_phase: "integracao",
      email: "",
      phone: "",
      instagram_profile: "",
      has_parking: false,
      parking_spots: 0,
      has_partner_parking: false,
      partner_parking_address: "",
      purchases_active: true, // true por padrão pois store_phase inicial é "operacao"
      sales_active: true, // true por padrão pois store_phase inicial é "operacao"
      // Reset operation hours
      operation_mon: "",
      operation_tue: "",
      operation_wed: "",
      operation_thu: "",
      operation_fri: "",
      operation_sat: "",
      operation_sun: "",
      operation_hol: "",
    }));
  };

  const setExistingFranchisee = (franchiseeId: string) => {
    setExistingFranchiseeId(franchiseeId);
    setFranchiseeId(franchiseeId);
  };

  // Função auxiliar para notificar n8n quando um novo franqueado é criado
  const notifyN8n = async (franchiseeData: {
    id: string;
    cpf: string;
    nome: string;
    telefone: string;
    codigo_unidade: string;
  }) => {
    try {
      console.log('📤 Enviando notificação para n8n:', franchiseeData);
      
      const { data, error } = await supabase.functions.invoke(
        'notify-franchisee-created',
        {
          body: {
            cpf: franchiseeData.cpf,
            nome: franchiseeData.nome,
            telefone: franchiseeData.telefone,
            id: franchiseeData.id
          }
        }
      );

      if (error) {
        console.error('❌ Erro ao notificar n8n:', error);
        // Não impede o fluxo principal
      } else {
        console.log('✅ n8n notificado com sucesso:', data);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao notificar n8n:', error);
      // Não impede o fluxo principal
    }
  };

  const submitForm = async (): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // Validações básicas
      if (!formData.cpf_rnm || !formData.full_name) {
        toast.error("CPF e nome completo são obrigatórios");
        return false;
      }

      // Verificar se é vinculação de unidade existente
      if (formData._linking_existing_unit && formData._existing_unit_id) {
        console.log('🔗 Detectado fluxo de vinculação de unidade existente');
        console.log('🎯 ID da unidade existente:', formData._existing_unit_id);
        
        // Chamar linkExistingUnit diretamente
        const success = await linkExistingUnit(formData._existing_unit_id);
        if (success) {
          console.log('✅ Vinculação de unidade existente concluída com sucesso!');
          return true;
        } else {
          console.error('❌ Falha na vinculação de unidade existente');
          return false;
        }
      }

      // Fluxo normal - validar código de unidade nova
      // VALIDAÇÃO CRÍTICA: Verificar se código de unidade existe na base de dados
      if (formData.group_code) {
        const { data: unitExists, error } = await supabase
          .from('unidades_old' as any)
          .select('group_code')
          .eq('group_code', formData.group_code)
          .maybeSingle();

        if (error) {
          console.error('Erro ao validar código da unidade:', error);
          toast.error("Erro ao validar código da unidade. Tente novamente.");
          return false;
        }

        if (!unitExists) {
          toast.error("Código de unidade inválido. Selecione uma unidade válida da lista de sugestões.");
          return false;
        }

        console.log('✅ Código de unidade validado:', formData.group_code);
      }

      if (!formData.group_code || formData.group_code <= 0) {
        toast.error("Código do grupo é obrigatório e deve ser maior que 0");
        return false;
      }

      // Validar estacionamento parceiro se estiver habilitado
      if (formData.has_partner_parking && !formData.partner_parking_address) {
        toast.error("Endereço do estacionamento parceiro é obrigatório quando estacionamento parceiro está habilitado");
        return false;
      }

      // Prepare franchisee data
      const franchiseeData = {
        cpf_rnm: formData.cpf_rnm,
        full_name: formData.full_name,
        birth_date: formData.birth_date || null,
        email: formData.franchisee_email || null,
        contact: cleanPhoneNumber(formData.contact), // Sempre salvar apenas números
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

      // Prepare unit data
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

      // Insert franchisee first
      const franchiseeResult = await supabase
        .from('franqueados')
        .upsert(franchiseeData, { onConflict: 'cpf_rnm' })
        .select('id')
        .single();

      if (franchiseeResult.error) {
        console.error('Franchisee upsert error:', franchiseeResult.error);
        if (franchiseeResult.error.code === '23505') {
          toast.error("CPF já cadastrado no sistema");
        } else {
          toast.error(`Erro ao salvar dados do franqueado: ${franchiseeResult.error.message}`);
        }
        return false;
      }

      // Insert unit
      const unitResult = await supabase
        .from('unidades')
        .upsert(unitData, { onConflict: 'group_code' })
        .select('id')
        .single();

      if (unitResult.error) {
        console.error('Unit upsert error:', unitResult.error);
        if (unitResult.error.code === '23505') {
          toast.error("Código do grupo já cadastrado no sistema");
        } else {
          toast.error(`Erro ao salvar dados da unidade: ${unitResult.error.message}`);
        }
        return false;
      }

      // Create the relationship in franqueados_unidades table
      const currentFranchiseeId = franchiseeResult.data.id;
      const unitId = unitResult.data.id;

      const relationshipResult = await supabase
        .from('franqueados_unidades')
        .insert({ 
          franqueado_id: currentFranchiseeId, 
          unidade_id: unitId 
        });

      if (relationshipResult.error) {
        console.error('Relationship insert error:', relationshipResult.error);
        // Se o relacionamento já existe, não é um erro crítico
        if (relationshipResult.error.code !== '23505') {
          toast.error(`Erro ao criar vínculo franqueado-unidade: ${relationshipResult.error.message}`);
          return false;
        }
      }

      // Store franchisee ID for future unit registrations
      setFranchiseeId(currentFranchiseeId);

      // Notificar n8n sobre o novo franqueado criado
      await notifyN8n({
        id: currentFranchiseeId,
        cpf: formData.cpf_rnm,
        nome: formData.full_name,
        telefone: cleanPhoneNumber(formData.contact), // Enviar apenas números
        codigo_unidade: String(formData.group_code)
      });

      toast.success("Cadastro realizado com sucesso!");
      return true;
      
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Erro inesperado ao submeter o formulário. Verifique os dados e tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitNewUnit = async (): Promise<boolean> => {
    if (!franchiseeId) {
      toast.error("Erro: ID do franqueado não encontrado");
      return false;
    }

    setIsSubmitting(true);
    
    try {
      // Validações básicas para nova unidade
      if (!formData.group_code || formData.group_code <= 0) {
        toast.error("Código do grupo é obrigatório e deve ser maior que 0");
        return false;
      }

      // VALIDAÇÃO CRÍTICA: Verificar se código de unidade existe na base de dados
      const { data: unitExists, error } = await supabase
        .from('unidades_old' as any)
        .select('group_code')
        .eq('group_code', formData.group_code)
        .maybeSingle();

      if (error) {
        console.error('Erro ao validar código da unidade:', error);
        toast.error("Erro ao validar código da unidade. Tente novamente.");
        return false;
      }

      if (!unitExists) {
        toast.error("Código de unidade inválido. Selecione uma unidade válida da lista de sugestões.");
        return false;
      }

      console.log('✅ Código de unidade validado para nova unidade:', formData.group_code);

      // Validar estacionamento parceiro se estiver habilitado
      if (formData.has_partner_parking && !formData.partner_parking_address) {
        toast.error("Endereço do estacionamento parceiro é obrigatório quando estacionamento parceiro está habilitado");
        return false;
      }

      // Prepare unit data
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

      // Insert new unit
      const unitResult = await supabase
        .from('unidades')
        .upsert(unitData, { onConflict: 'group_code' })
        .select('id')
        .single();

      if (unitResult.error) {
        console.error('Unit upsert error:', unitResult.error);
        if (unitResult.error.code === '23505') {
          toast.error("Código do grupo já cadastrado no sistema");
        } else {
          toast.error(`Erro ao salvar dados da unidade: ${unitResult.error.message}`);
        }
        return false;
      }

      // Create the relationship in franqueados_unidades table
      const unitId = unitResult.data.id;

      const relationshipResult = await supabase
        .from('franqueados_unidades')
        .insert({ 
          franqueado_id: franchiseeId, 
          unidade_id: unitId 
        });

      if (relationshipResult.error) {
        console.error('Relationship insert error:', relationshipResult.error);
        // Se o relacionamento já existe, não é um erro crítico
        if (relationshipResult.error.code !== '23505') {
          toast.error(`Erro ao criar vínculo franqueado-unidade: ${relationshipResult.error.message}`);
          return false;
        }
      }

      toast.success("Nova unidade cadastrada com sucesso!");
      return true;
      
    } catch (error) {
      console.error('New unit submission error:', error);
      toast.error("Erro inesperado ao cadastrar nova unidade. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkExistingUnit = async (unitId: string): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // Validações básicas
      if (!formData.cpf_rnm || !formData.full_name) {
        toast.error("CPF e nome completo são obrigatórios");
        return false;
      }

      // Prepare franchisee data
      const franchiseeData = {
        cpf_rnm: formData.cpf_rnm,
        full_name: formData.full_name,
        birth_date: formData.birth_date || null,
        email: formData.franchisee_email || null,
        contact: cleanPhoneNumber(formData.contact), // Sempre salvar apenas números
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

      // Insert franchisee data
      const franchiseeResult = await supabase
        .from('franqueados')
        .upsert(franchiseeData, { onConflict: 'cpf_rnm' })
        .select('id')
        .single();

      if (franchiseeResult.error) {
        console.error('Franchisee upsert error:', franchiseeResult.error);
        toast.error(`Erro ao salvar dados do franqueado: ${franchiseeResult.error.message}`);
        return false;
      }

      const franchiseeIdResult = franchiseeResult.data.id;
      setFranchiseeId(franchiseeIdResult);

      // Notificar n8n sobre o franqueado criado/atualizado
      await notifyN8n({
        id: franchiseeIdResult,
        cpf: formData.cpf_rnm,
        nome: formData.full_name,
        telefone: cleanPhoneNumber(formData.contact), // Enviar apenas números
        codigo_unidade: String(formData.group_code)
      });

      // Verificar se este franqueado já está vinculado a esta unidade
      console.log('🔍 Verificando se este franqueado já está vinculado a esta unidade...');
      const { data: existingRelation } = await supabase
        .from('franqueados_unidades')
        .select('id')
        .eq('unidade_id', unitId)
        .eq('franqueado_id', franchiseeIdResult)
        .maybeSingle();

      if (existingRelation) {
        console.log('⚠️ Este franqueado já está vinculado a esta unidade');
        toast.success("Franqueado já vinculado a esta unidade!");
        return true;
      }

      // Criar nova relação (permitir múltiplos franqueados na mesma unidade)
      console.log('➕ Criando nova relação franqueado-unidade...');
      const { error: insertError } = await supabase
        .from('franqueados_unidades')
        .insert({ 
          franqueado_id: franchiseeIdResult, 
          unidade_id: unitId 
        });

      if (insertError) {
        console.error('❌ Erro ao criar relação:', insertError);
        toast.error(`Erro ao vincular franqueado à unidade: ${insertError.message}`);
        return false;
      }

      console.log('✅ Nova relação criada com sucesso');
      toast.success("Franqueado vinculado à unidade com sucesso!");
      return true;

    } catch (error) {
      console.error('Link existing unit error:', error);
      toast.error("Erro inesperado ao vincular unidade. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    updateFormData,
    submitForm,
    submitNewUnit,
    resetUnitData,
    linkExistingUnit,
    isSubmitting,
    franchiseeId,
    setExistingFranchisee
  };
};