export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cargos_loja: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["store_role_enum"]
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["store_role_enum"]
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["store_role_enum"]
        }
        Relationships: []
      }
      clientes: {
        Row: {
          address: string | null
          address_complement: string | null
          birth_date: string | null
          city: string | null
          cpf_rnm: string
          created_at: string | null
          discovery_source: string | null
          email: string | null
          full_name: string
          id: number
          nationality: string | null
          neighborhood: string | null
          number_address: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          uf: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          birth_date?: string | null
          city?: string | null
          cpf_rnm: string
          created_at?: string | null
          discovery_source?: string | null
          email?: string | null
          full_name: string
          id?: never
          nationality?: string | null
          neighborhood?: string | null
          number_address?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          uf?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          birth_date?: string | null
          city?: string | null
          cpf_rnm?: string
          created_at?: string | null
          discovery_source?: string | null
          email?: string | null
          full_name?: string
          id?: never
          nationality?: string | null
          neighborhood?: string | null
          number_address?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          uf?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clientes_filhos: {
        Row: {
          address: string | null
          address_complement: string | null
          age: number | null
          birth_date: string
          city: string | null
          cpf: string
          created_at: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id: number
          name: string
          nationality: string | null
          neighborhood: string | null
          number_address: string | null
          postal_code: string | null
          school_grade: string | null
          shirt_number: Database["public"]["Enums"]["shirt_size"] | null
          state: string | null
          uf: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          age?: number | null
          birth_date: string
          city?: string | null
          cpf: string
          created_at?: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id?: never
          name: string
          nationality?: string | null
          neighborhood?: string | null
          number_address?: string | null
          postal_code?: string | null
          school_grade?: string | null
          shirt_number?: Database["public"]["Enums"]["shirt_size"] | null
          state?: string | null
          uf?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          age?: number | null
          birth_date?: string
          city?: string | null
          cpf?: string
          created_at?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: never
          name?: string
          nationality?: string | null
          neighborhood?: string | null
          number_address?: string | null
          postal_code?: string | null
          school_grade?: string | null
          shirt_number?: Database["public"]["Enums"]["shirt_size"] | null
          state?: string | null
          uf?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      colaboradores_interno: {
        Row: {
          address: string | null
          address_complement: string | null
          admission_date: string
          basic_food_basket_active: boolean
          basic_food_basket_value: string | null
          birth_date: string
          cash_access: boolean
          city: string | null
          confidentiality_term: boolean
          cost_assistance_active: boolean
          cost_assistance_value: string | null
          cpf: string
          created_at: string | null
          email: string
          employee_name: string
          evaluation_access: boolean
          health_plan: boolean
          id: string
          instagram_profile: string | null
          lgpd_term: boolean
          meal_voucher_active: boolean
          meal_voucher_value: string | null
          neighborhood: string | null
          number_address: string | null
          phone: string
          position_id: string
          postal_code: string | null
          salary: string
          state: string | null
          support: boolean
          system_term: boolean
          training: boolean
          transport_voucher_active: boolean
          transport_voucher_value: string | null
          uf: string | null
          updated_at: string | null
          web_password: string
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          admission_date: string
          basic_food_basket_active?: boolean
          basic_food_basket_value?: string | null
          birth_date: string
          cash_access?: boolean
          city?: string | null
          confidentiality_term?: boolean
          cost_assistance_active?: boolean
          cost_assistance_value?: string | null
          cpf: string
          created_at?: string | null
          email: string
          employee_name: string
          evaluation_access?: boolean
          health_plan?: boolean
          id?: string
          instagram_profile?: string | null
          lgpd_term?: boolean
          meal_voucher_active?: boolean
          meal_voucher_value?: string | null
          neighborhood?: string | null
          number_address?: string | null
          phone: string
          position_id: string
          postal_code?: string | null
          salary: string
          state?: string | null
          support?: boolean
          system_term?: boolean
          training?: boolean
          transport_voucher_active?: boolean
          transport_voucher_value?: string | null
          uf?: string | null
          updated_at?: string | null
          web_password: string
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          admission_date?: string
          basic_food_basket_active?: boolean
          basic_food_basket_value?: string | null
          birth_date?: string
          cash_access?: boolean
          city?: string | null
          confidentiality_term?: boolean
          cost_assistance_active?: boolean
          cost_assistance_value?: string | null
          cpf?: string
          created_at?: string | null
          email?: string
          employee_name?: string
          evaluation_access?: boolean
          health_plan?: boolean
          id?: string
          instagram_profile?: string | null
          lgpd_term?: boolean
          meal_voucher_active?: boolean
          meal_voucher_value?: string | null
          neighborhood?: string | null
          number_address?: string | null
          phone?: string
          position_id?: string
          postal_code?: string | null
          salary?: string
          state?: string | null
          support?: boolean
          system_term?: boolean
          training?: boolean
          transport_voucher_active?: boolean
          transport_voucher_value?: string | null
          uf?: string | null
          updated_at?: string | null
          web_password?: string
        }
        Relationships: []
      }
      colaboradores_loja: {
        Row: {
          address: string | null
          address_complement: string | null
          admission_date: string
          basic_food_basket_active: boolean
          basic_food_basket_value: string | null
          birth_date: string
          cash_access: boolean
          city: string | null
          confidentiality_term: boolean
          cost_assistance_active: boolean
          cost_assistance_value: string | null
          cpf: string
          created_at: string | null
          email: string
          employee_name: string
          evaluation_access: boolean
          health_plan: boolean
          id: string
          instagram_profile: string | null
          lgpd_term: boolean
          meal_voucher_active: boolean
          meal_voucher_value: string | null
          neighborhood: string | null
          number_address: string | null
          phone: string
          position_id: string
          postal_code: string | null
          salary: string
          state: string | null
          support: boolean
          system_term: boolean
          training: boolean
          transport_voucher_active: boolean
          transport_voucher_value: string | null
          uf: string | null
          updated_at: string | null
          web_password: string
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          admission_date: string
          basic_food_basket_active?: boolean
          basic_food_basket_value?: string | null
          birth_date: string
          cash_access?: boolean
          city?: string | null
          confidentiality_term?: boolean
          cost_assistance_active?: boolean
          cost_assistance_value?: string | null
          cpf: string
          created_at?: string | null
          email: string
          employee_name: string
          evaluation_access?: boolean
          health_plan?: boolean
          id?: string
          instagram_profile?: string | null
          lgpd_term?: boolean
          meal_voucher_active?: boolean
          meal_voucher_value?: string | null
          neighborhood?: string | null
          number_address?: string | null
          phone: string
          position_id: string
          postal_code?: string | null
          salary: string
          state?: string | null
          support?: boolean
          system_term?: boolean
          training?: boolean
          transport_voucher_active?: boolean
          transport_voucher_value?: string | null
          uf?: string | null
          updated_at?: string | null
          web_password: string
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          admission_date?: string
          basic_food_basket_active?: boolean
          basic_food_basket_value?: string | null
          birth_date?: string
          cash_access?: boolean
          city?: string | null
          confidentiality_term?: boolean
          cost_assistance_active?: boolean
          cost_assistance_value?: string | null
          cpf?: string
          created_at?: string | null
          email?: string
          employee_name?: string
          evaluation_access?: boolean
          health_plan?: boolean
          id?: string
          instagram_profile?: string | null
          lgpd_term?: boolean
          meal_voucher_active?: boolean
          meal_voucher_value?: string | null
          neighborhood?: string | null
          number_address?: string | null
          phone?: string
          position_id?: string
          postal_code?: string | null
          salary?: string
          state?: string | null
          support?: boolean
          system_term?: boolean
          training?: boolean
          transport_voucher_active?: boolean
          transport_voucher_value?: string | null
          uf?: string | null
          updated_at?: string | null
          web_password?: string
        }
        Relationships: []
      }
      evento_seguidores: {
        Row: {
          group_code: number
          group_name: string | null
          ultimo_evento: string | null
        }
        Insert: {
          group_code: number
          group_name?: string | null
          ultimo_evento?: string | null
        }
        Update: {
          group_code?: number
          group_name?: string | null
          ultimo_evento?: string | null
        }
        Relationships: []
      }
      franqueados: {
        Row: {
          address: string | null
          address_complement: string | null
          availability: string | null
          birth_date: string | null
          city: string | null
          confidentiality_term_accepted: boolean
          contact: string
          cpf_rnm: string
          created_at: string | null
          discovery_source: string | null
          education: string | null
          email: string | null
          full_name: string
          has_other_activities: boolean | null
          id: string
          instagram: string | null
          is_active_system: boolean
          is_in_contract: boolean
          lgpd_term_accepted: boolean
          nationality: string | null
          neighborhood: string | null
          number_address: string | null
          other_activities_description: string | null
          owner_type: string
          postal_code: string | null
          previous_profession: string | null
          previous_salary_range: string | null
          profile_image: string | null
          prolabore_value: number | null
          receives_prolabore: boolean | null
          referrer_name: string | null
          referrer_unit_code: string | null
          state: string | null
          system_term_accepted: boolean
          systems_password: number
          uf: string | null
          updated_at: string | null
          was_entrepreneur: boolean | null
          was_referred: boolean | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          availability?: string | null
          birth_date?: string | null
          city?: string | null
          confidentiality_term_accepted?: boolean
          contact: string
          cpf_rnm: string
          created_at?: string | null
          discovery_source?: string | null
          education?: string | null
          email?: string | null
          full_name: string
          has_other_activities?: boolean | null
          id?: string
          instagram?: string | null
          is_active_system?: boolean
          is_in_contract?: boolean
          lgpd_term_accepted?: boolean
          nationality?: string | null
          neighborhood?: string | null
          number_address?: string | null
          other_activities_description?: string | null
          owner_type: string
          postal_code?: string | null
          previous_profession?: string | null
          previous_salary_range?: string | null
          profile_image?: string | null
          prolabore_value?: number | null
          receives_prolabore?: boolean | null
          referrer_name?: string | null
          referrer_unit_code?: string | null
          state?: string | null
          system_term_accepted?: boolean
          systems_password?: number
          uf?: string | null
          updated_at?: string | null
          was_entrepreneur?: boolean | null
          was_referred?: boolean | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          availability?: string | null
          birth_date?: string | null
          city?: string | null
          confidentiality_term_accepted?: boolean
          contact?: string
          cpf_rnm?: string
          created_at?: string | null
          discovery_source?: string | null
          education?: string | null
          email?: string | null
          full_name?: string
          has_other_activities?: boolean | null
          id?: string
          instagram?: string | null
          is_active_system?: boolean
          is_in_contract?: boolean
          lgpd_term_accepted?: boolean
          nationality?: string | null
          neighborhood?: string | null
          number_address?: string | null
          other_activities_description?: string | null
          owner_type?: string
          postal_code?: string | null
          previous_profession?: string | null
          previous_salary_range?: string | null
          profile_image?: string | null
          prolabore_value?: number | null
          receives_prolabore?: boolean | null
          referrer_name?: string | null
          referrer_unit_code?: string | null
          state?: string | null
          system_term_accepted?: boolean
          systems_password?: number
          uf?: string | null
          updated_at?: string | null
          was_entrepreneur?: boolean | null
          was_referred?: boolean | null
        }
        Relationships: []
      }
      franqueados_audit_log: {
        Row: {
          accessed_fields: string[] | null
          action: string
          created_at: string | null
          franqueado_id: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accessed_fields?: string[] | null
          action: string
          created_at?: string | null
          franqueado_id?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accessed_fields?: string[] | null
          action?: string
          created_at?: string | null
          franqueado_id?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      franqueados_filhos: {
        Row: {
          address: string | null
          address_complement: string | null
          age: number | null
          birth_date: string
          city: string | null
          cpf: string
          created_at: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id: number
          name: string
          nationality: string | null
          neighborhood: string | null
          number_address: string | null
          postal_code: string | null
          school_grade: string | null
          shirt_number: Database["public"]["Enums"]["shirt_size"] | null
          state: string | null
          uf: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          age?: number | null
          birth_date: string
          city?: string | null
          cpf: string
          created_at?: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id?: never
          name: string
          nationality?: string | null
          neighborhood?: string | null
          number_address?: string | null
          postal_code?: string | null
          school_grade?: string | null
          shirt_number?: Database["public"]["Enums"]["shirt_size"] | null
          state?: string | null
          uf?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          age?: number | null
          birth_date?: string
          city?: string | null
          cpf?: string
          created_at?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: never
          name?: string
          nationality?: string | null
          neighborhood?: string | null
          number_address?: string | null
          postal_code?: string | null
          school_grade?: string | null
          shirt_number?: Database["public"]["Enums"]["shirt_size"] | null
          state?: string | null
          uf?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      franqueados_unidades: {
        Row: {
          created_at: string
          franqueado_id: string
          id: number
          unidade_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          franqueado_id: string
          id?: never
          unidade_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          franqueado_id?: string
          id?: never
          unidade_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      permissoes: {
        Row: {
          id: string
          level: string
        }
        Insert: {
          id?: string
          level: string
        }
        Update: {
          id?: string
          level?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          created_by: string | null
          full_name: string
          id: string
          notes: string | null
          phone_number: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone_number: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone_number?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      senhas: {
        Row: {
          a2f_active: boolean
          account_id: string | null
          authentication_code: string | null
          created_at: string | null
          id: string
          login: string
          password: string
          platform: string
          token: string | null
          updated_at: string | null
        }
        Insert: {
          a2f_active?: boolean
          account_id?: string | null
          authentication_code?: string | null
          created_at?: string | null
          id?: string
          login: string
          password: string
          platform: string
          token?: string | null
          updated_at?: string | null
        }
        Update: {
          a2f_active?: boolean
          account_id?: string | null
          authentication_code?: string | null
          created_at?: string | null
          id?: string
          login?: string
          password?: string
          platform?: string
          token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tipos_grupos: {
        Row: {
          ai_id: string | null
          colab_id: string | null
          complaining_id: string | null
          created_at: string
          id: string
          intensive_support_id: string | null
          main_id: string | null
          notifications_id: string | null
          purchasing_phase_id: string | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          ai_id?: string | null
          colab_id?: string | null
          complaining_id?: string | null
          created_at?: string
          id?: string
          intensive_support_id?: string | null
          main_id?: string | null
          notifications_id?: string | null
          purchasing_phase_id?: string | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          ai_id?: string | null
          colab_id?: string | null
          complaining_id?: string | null
          created_at?: string
          id?: string
          intensive_support_id?: string | null
          main_id?: string | null
          notifications_id?: string | null
          purchasing_phase_id?: string | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tipos_grupos_ai_id_fkey"
            columns: ["ai_id"]
            isOneToOne: false
            referencedRelation: "unidades_grupos_whatsapp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tipos_grupos_colab_id_fkey"
            columns: ["colab_id"]
            isOneToOne: false
            referencedRelation: "unidades_grupos_whatsapp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tipos_grupos_complaining_id_fkey"
            columns: ["complaining_id"]
            isOneToOne: false
            referencedRelation: "unidades_grupos_whatsapp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tipos_grupos_intensive_support_id_fkey"
            columns: ["intensive_support_id"]
            isOneToOne: false
            referencedRelation: "unidades_grupos_whatsapp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tipos_grupos_main_id_fkey"
            columns: ["main_id"]
            isOneToOne: false
            referencedRelation: "unidades_grupos_whatsapp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tipos_grupos_notifications_id_fkey"
            columns: ["notifications_id"]
            isOneToOne: false
            referencedRelation: "unidades_grupos_whatsapp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tipos_grupos_purchasing_phase_id_fkey"
            columns: ["purchasing_phase_id"]
            isOneToOne: false
            referencedRelation: "unidades_grupos_whatsapp"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades: {
        Row: {
          address: string | null
          address_complement: string | null
          ai_agent_id: string | null
          city: string | null
          cnpj: string | null
          created_at: string
          docs_folder_id: string | null
          docs_folder_link: string | null
          drive_folder_id: string | null
          drive_folder_link: string | null
          email: string | null
          fantasy_name: string | null
          group_code: number
          group_name: string
          has_parking: boolean | null
          has_partner_parking: boolean | null
          id: string
          instagram_profile: string | null
          is_active: boolean
          neighborhood: string | null
          notion_page_id: string | null
          number_address: string | null
          operation_fri: string | null
          operation_hol: string | null
          operation_mon: string | null
          operation_sat: string | null
          operation_sun: string | null
          operation_thu: string | null
          operation_tue: string | null
          operation_wed: string | null
          parking_spots: number | null
          partner_parking_address: string | null
          phone: string | null
          postal_code: string | null
          purchases_active: boolean | null
          sales_active: boolean | null
          state: string | null
          store_imp_phase: string | null
          store_model: string
          store_phase: string
          uf: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          ai_agent_id?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          docs_folder_id?: string | null
          docs_folder_link?: string | null
          drive_folder_id?: string | null
          drive_folder_link?: string | null
          email?: string | null
          fantasy_name?: string | null
          group_code?: number
          group_name: string
          has_parking?: boolean | null
          has_partner_parking?: boolean | null
          id?: string
          instagram_profile?: string | null
          is_active?: boolean
          neighborhood?: string | null
          notion_page_id?: string | null
          number_address?: string | null
          operation_fri?: string | null
          operation_hol?: string | null
          operation_mon?: string | null
          operation_sat?: string | null
          operation_sun?: string | null
          operation_thu?: string | null
          operation_tue?: string | null
          operation_wed?: string | null
          parking_spots?: number | null
          partner_parking_address?: string | null
          phone?: string | null
          postal_code?: string | null
          purchases_active?: boolean | null
          sales_active?: boolean | null
          state?: string | null
          store_imp_phase?: string | null
          store_model: string
          store_phase?: string
          uf?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          ai_agent_id?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          docs_folder_id?: string | null
          docs_folder_link?: string | null
          drive_folder_id?: string | null
          drive_folder_link?: string | null
          email?: string | null
          fantasy_name?: string | null
          group_code?: number
          group_name?: string
          has_parking?: boolean | null
          has_partner_parking?: boolean | null
          id?: string
          instagram_profile?: string | null
          is_active?: boolean
          neighborhood?: string | null
          notion_page_id?: string | null
          number_address?: string | null
          operation_fri?: string | null
          operation_hol?: string | null
          operation_mon?: string | null
          operation_sat?: string | null
          operation_sun?: string | null
          operation_thu?: string | null
          operation_tue?: string | null
          operation_wed?: string | null
          parking_spots?: number | null
          partner_parking_address?: string | null
          phone?: string | null
          postal_code?: string | null
          purchases_active?: boolean | null
          sales_active?: boolean | null
          state?: string | null
          store_imp_phase?: string | null
          store_model?: string
          store_phase?: string
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      unidades_grupos_whatsapp: {
        Row: {
          created_at: string
          group_id: string
          id: string
          kind: Database["public"]["Enums"]["whatsapp_group_kind_enum"]
          unit_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          kind: Database["public"]["Enums"]["whatsapp_group_kind_enum"]
          unit_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["whatsapp_group_kind_enum"]
          unit_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_sensitive_data: {
        Args: { _franqueado_id?: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_franqueados_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          address_masked: string
          availability: string
          contact_masked: string
          cpf_rnm_masked: string
          created_at: string
          full_name: string
          id: string
          is_in_contract: boolean
          owner_type: string
          prolabore_value: number
          receives_prolabore: boolean
        }[]
      }
      get_users_with_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          created_by: string
          email: string
          full_name: string
          id: string
          notes: string
          phone_number: string
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_franqueado_access: {
        Args: {
          _accessed_fields?: string[]
          _action: string
          _franqueado_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "franqueado" | "user"
      gender_type: "Masculino" | "Feminino"
      permission_level:
        | "admin"
        | "manager"
        | "supervisor"
        | "user"
        | "developer"
        | "auditor"
        | "custom user"
        | "guest"
      shirt_size:
        | "PP"
        | "P"
        | "M"
        | "G"
        | "GG"
        | "XG"
        | "1"
        | "2"
        | "3"
        | "4"
        | "5"
        | "6"
        | "7"
        | "8"
        | "9"
        | "10"
        | "11"
        | "12"
        | "13"
        | "14"
        | "15"
        | "16"
      store_imp_phase_enum:
        | "integracao"
        | "treinamento"
        | "procura_de_ponto"
        | "estruturacao"
        | "compras"
        | "inauguracao"
      store_model_enum:
        | "junior"
        | "light"
        | "padrao"
        | "intermediaria"
        | "mega_store"
        | "pontinha"
      store_phase_enum: "implantacao" | "operacao"
      store_role_enum:
        | "Store Assistant"
        | "Cashier"
        | "Evaluator"
        | "Cleaner"
        | "Cleaning Assistant"
        | "Social Media"
        | "Stocker"
        | "HR"
        | "Manager"
        | "Store Leader"
        | "Replenisher"
        | "Partner"
        | "Main"
      whatsapp_group_kind_enum:
        | "main"
        | "ai"
        | "intensive_support"
        | "colab"
        | "complaining"
        | "notifications"
        | "purchasing_phase"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "franqueado", "user"],
      gender_type: ["Masculino", "Feminino"],
      permission_level: [
        "admin",
        "manager",
        "supervisor",
        "user",
        "developer",
        "auditor",
        "custom user",
        "guest",
      ],
      shirt_size: [
        "PP",
        "P",
        "M",
        "G",
        "GG",
        "XG",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
      ],
      store_imp_phase_enum: [
        "integracao",
        "treinamento",
        "procura_de_ponto",
        "estruturacao",
        "compras",
        "inauguracao",
      ],
      store_model_enum: [
        "junior",
        "light",
        "padrao",
        "intermediaria",
        "mega_store",
        "pontinha",
      ],
      store_phase_enum: ["implantacao", "operacao"],
      store_role_enum: [
        "Store Assistant",
        "Cashier",
        "Evaluator",
        "Cleaner",
        "Cleaning Assistant",
        "Social Media",
        "Stocker",
        "HR",
        "Manager",
        "Store Leader",
        "Replenisher",
        "Partner",
        "Main",
      ],
      whatsapp_group_kind_enum: [
        "main",
        "ai",
        "intensive_support",
        "colab",
        "complaining",
        "notifications",
        "purchasing_phase",
      ],
    },
  },
} as const
