import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OnboardingFormData {
  // Franchisee data
  cpf_rnm: string;
  full_name: string;
  birth_date: string;
  email: string;
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
  
  // Franchisee address data
  franchisee_postal_code: string;
  franchisee_address: string;
  franchisee_number_address: string;
  franchisee_address_complement: string;
  franchisee_neighborhood: string;
  franchisee_city: string;
  franchisee_state: string;
  franchisee_uf: string;
  
  // Unit address data
  unit_postal_code: string;
  unit_address: string;
  unit_number_address: string;
  unit_address_complement: string;
  unit_neighborhood: string;
  unit_city: string;
  unit_state: string;
  unit_uf: string;
  
  // Unit data
  cnpj: string;
  group_name: string;
  group_code: number;
  store_model: string;
  store_phase: string;
  store_imp_phase: string;
  email_unit: string;
  phone_unit: string;
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
  email: "",
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
  franchisee_postal_code: "",
  franchisee_address: "",
  franchisee_number_address: "",
  franchisee_address_complement: "",
  franchisee_neighborhood: "",
  franchisee_city: "",
  franchisee_state: "",
  franchisee_uf: "",
  unit_postal_code: "",
  unit_address: "",
  unit_number_address: "",
  unit_address_complement: "",
  unit_neighborhood: "",
  unit_city: "",
  unit_state: "",
  unit_uf: "",
  cnpj: "",
  group_name: "",
  group_code: 0,
  store_model: "padrao",
  store_phase: "implantacao",
  store_imp_phase: "integracao",
  email_unit: "",
  phone_unit: "",
  instagram_profile: "",
  has_parking: false,
  parking_spots: 0,
  has_partner_parking: false,
  partner_parking_address: "",
  purchases_active: false,
  sales_active: false,
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

  const updateFormData = (updates: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const submitForm = async (): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // Prepare franchisee data
      const franchiseeData = {
        cpf_rnm: formData.cpf_rnm,
        full_name: formData.full_name,
        birth_date: formData.birth_date,
        email: formData.email,
        contact: formData.contact,
        nationality: formData.nationality,
        owner_type: formData.owner_type,
        education: formData.education,
        previous_profession: formData.previous_profession,
        previous_salary_range: formData.previous_salary_range,
        was_entrepreneur: formData.was_entrepreneur,
        availability: formData.availability,
        discovery_source: formData.discovery_source,
        was_referred: formData.was_referred,
        referrer_name: formData.referrer_name,
        referrer_unit_code: formData.referrer_unit_code,
        has_other_activities: formData.has_other_activities,
        other_activities_description: formData.other_activities_description,
        receives_prolabore: formData.receives_prolabore,
        prolabore_value: formData.prolabore_value,
        profile_image: formData.profile_image,
        instagram: formData.instagram,
        address: formData.franchisee_address,
        number_address: formData.franchisee_number_address,
        address_complement: formData.franchisee_address_complement,
        neighborhood: formData.franchisee_neighborhood,
        city: formData.franchisee_city,
        state: formData.franchisee_state,
        uf: formData.franchisee_uf,
        postal_code: formData.franchisee_postal_code,
        system_term_accepted: formData.system_term_accepted,
        confidentiality_term_accepted: formData.confidentiality_term_accepted,
        lgpd_term_accepted: formData.lgpd_term_accepted,
        is_in_contract: false,
        is_active_system: true,
      };

      // Prepare unit data
      const unitData = {
        cnpj: formData.cnpj,
        group_name: formData.group_name,
        group_code: formData.group_code,
        store_model: formData.store_model,
        store_phase: formData.store_phase,
        store_imp_phase: formData.store_imp_phase,
        email: formData.email_unit,
        phone: formData.phone_unit,
        instagram_profile: formData.instagram_profile,
        has_parking: formData.has_parking,
        parking_spots: formData.parking_spots,
        has_partner_parking: formData.has_partner_parking,
        partner_parking_address: formData.partner_parking_address,
        purchases_active: formData.purchases_active,
        sales_active: formData.sales_active,
        address: formData.unit_address,
        number_address: formData.unit_number_address,
        address_complement: formData.unit_address_complement,
        neighborhood: formData.unit_neighborhood,
        city: formData.unit_city,
        state: formData.unit_state,
        uf: formData.unit_uf,
        postal_code: formData.unit_postal_code,
        operation_mon: formData.operation_mon,
        operation_tue: formData.operation_tue,
        operation_wed: formData.operation_wed,
        operation_thu: formData.operation_thu,
        operation_fri: formData.operation_fri,
        operation_sat: formData.operation_sat,
        operation_sun: formData.operation_sun,
        operation_hol: formData.operation_hol,
        is_active: true,
      };

      // Execute both upserts in parallel
      const [franchiseeResult, unitResult] = await Promise.all([
        supabase.from('franqueados').upsert(franchiseeData, { onConflict: 'cpf_rnm' }),
        supabase.from('unidades').upsert(unitData, { onConflict: 'cnpj' })
      ]);

      if (franchiseeResult.error) {
        console.error('Franchisee upsert error:', franchiseeResult.error);
        toast.error(`Erro ao salvar dados do franqueado: ${franchiseeResult.error.message}`);
        return false;
      }

      if (unitResult.error) {
        console.error('Unit upsert error:', unitResult.error);
        toast.error(`Erro ao salvar dados da unidade: ${unitResult.error.message}`);
        return false;
      }

      toast.success("Cadastro realizado com sucesso!");
      return true;
      
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Erro inesperado ao submeter o formulário");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    updateFormData,
    submitForm,
    isSubmitting,
  };
};