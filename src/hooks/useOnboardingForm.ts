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
            id: franchiseeData.id,
            codigo_unidade: franchiseeData.codigo_unidade
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
      console.log('🚀 Chamando Edge Function onboarding-submit');
      
      const { data, error } = await supabase.functions.invoke('onboarding-submit', {
        body: {
          action: 'submitForm',
          formData: formData
        }
      });

      if (error) {
        console.error('❌ Erro ao chamar Edge Function:', error);
        toast.error(`Erro ao processar cadastro: ${error.message}`);
        return false;
      }

      if (!data.success) {
        console.error('❌ Edge Function retornou erro:', data.error);
        toast.error(data.error || 'Erro ao processar cadastro');
        return false;
      }

      console.log('✅ Edge Function executada com sucesso:', data);
      
      // Armazenar franchiseeId para futuras submissões de unidades
      if (data.franchiseeId) {
        setFranchiseeId(data.franchiseeId);
      }

      // Notificar n8n sobre o novo franqueado criado
      if (data.franchiseeId) {
        await notifyN8n({
          id: data.franchiseeId,
          cpf: formData.cpf_rnm,
          nome: formData.full_name,
          telefone: cleanPhoneNumber(formData.contact),
          codigo_unidade: String(formData.group_code)
        });
      }

      toast.success(data.message || "Cadastro realizado com sucesso!");
      return true;
      
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
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
      console.log('🚀 Chamando Edge Function onboarding-submit para nova unidade');
      
      const { data, error } = await supabase.functions.invoke('onboarding-submit', {
        body: {
          action: 'submitNewUnit',
          formData: {
            ...formData,
            franchiseeId: franchiseeId
          }
        }
      });

      if (error) {
        console.error('❌ Erro ao chamar Edge Function:', error);
        toast.error(`Erro ao processar nova unidade: ${error.message}`);
        return false;
      }

      if (!data.success) {
        console.error('❌ Edge Function retornou erro:', data.error);
        toast.error(data.error || 'Erro ao processar nova unidade');
        return false;
      }

      console.log('✅ Edge Function executada com sucesso:', data);
      toast.success(data.message || "Nova unidade cadastrada com sucesso!");
      return true;
      
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast.error("Erro inesperado ao cadastrar nova unidade. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkExistingUnit = async (unitId: string): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      console.log('🚀 Chamando Edge Function onboarding-submit para vincular unidade existente');
      
      const { data, error } = await supabase.functions.invoke('onboarding-submit', {
        body: {
          action: 'submitForm',
          formData: {
            ...formData,
            _linking_existing_unit: true,
            _existing_unit_id: unitId
          }
        }
      });

      if (error) {
        console.error('❌ Erro ao chamar Edge Function:', error);
        toast.error(`Erro ao vincular unidade: ${error.message}`);
        return false;
      }

      if (!data.success) {
        console.error('❌ Edge Function retornou erro:', data.error);
        toast.error(data.error || 'Erro ao vincular unidade');
        return false;
      }

      console.log('✅ Edge Function executada com sucesso:', data);
      
      // Armazenar franchiseeId
      if (data.franchiseeId) {
        setFranchiseeId(data.franchiseeId);
      }

      // Notificar n8n
      if (data.franchiseeId) {
        await notifyN8n({
          id: data.franchiseeId,
          cpf: formData.cpf_rnm,
          nome: formData.full_name,
          telefone: cleanPhoneNumber(formData.contact),
          codigo_unidade: String(formData.group_code)
        });
      }

      toast.success(data.message || "Franqueado vinculado à unidade com sucesso!");
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
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