import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LookupRequest {
  type: 'cpf' | 'cnpj' | 'cep' | 'check-cnpj-exists';
  value: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, value }: LookupRequest = await req.json();

    console.log(`API Lookup request: ${type} - ${value}`);

    let result;
    
    switch (type) {
      case 'cpf':
        result = await lookupCpf(value);
        break;
      case 'cnpj':
        result = await lookupCnpj(value);
        break;
      case 'cep':
        result = await lookupCep(value);
        break;
      case 'check-cnpj-exists':
        result = await checkCnpjExists(value);
        break;
      default:
        throw new Error('Invalid lookup type');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in api-lookup function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkCnpjExists(cnpj: string) {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Find the unit by CNPJ
    const { data: unit, error: unitError } = await supabaseAdmin
      .from('unidades')
      .select('id, fantasy_name, group_code, group_name, cnpj')
      .eq('cnpj', cnpj)
      .maybeSingle();

    if (unitError) throw unitError;

    if (!unit) {
      return { exists: false };
    }

    // 2. Find the associated franchisee
    let franchiseeName = 'Franqueado não encontrado';
    const { data: relation, error: relationError } = await supabaseAdmin
      .from('franqueados_unidades')
      .select('franqueado_id')
      .eq('unidade_id', unit.id)
      .limit(1)
      .maybeSingle();

    if (relationError) {
        console.error("Error fetching franqueado_unidades:", relationError.message);
    }

    if (relation?.franqueado_id) {
      const { data: franchisee, error: franchiseeError } = await supabaseAdmin
        .from('franqueados')
        .select('full_name')
        .eq('id', relation.franqueado_id)
        .maybeSingle();
      
      if (franchiseeError) {
          console.error("Error fetching franqueados:", franchiseeError.message);
      }

      if (franchisee) {
        franchiseeName = franchisee.full_name;
      }
    }

    const unitData = {
      fantasy_name: unit.group_name || unit.fantasy_name || 'Unidade sem nome',
      franqueado_name: franchiseeName,
      unit_id: unit.id,
      group_code: unit.group_code || 0,
      group_name: unit.group_name || '',
      cnpj: unit.cnpj || cnpj
    };

    return { exists: true, unitData };

  } catch (error) {
    console.error('Error in checkCnpjExists:', error);
    return { exists: false, error: error.message };
  }
}


async function lookupCpf(cpf: string) {
  const hubdevApiKey = Deno.env.get('HUBDEV_API_KEY');
  
  if (!hubdevApiKey) {
    console.warn('HUBDEV_API_KEY not configured, returning mock data');
    // Return mock data for development/testing
    return {
      success: true,
      data: {
        nome: 'João Silva Santos',
        nascimento: '1985-03-15'
      }
    };
  }

  const startTime = Date.now();
  console.log(`⏱️ [${new Date().toISOString()}] Iniciando consulta HubDev API para CPF: ${cpf}`);

  try {
    // Get current date in DD/MM/YYYY format for the 'data' parameter
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    // Build the correct HUBDev API URL according to documentation
    const url = `http://ws.hubdodesenvolvedor.com.br/v2/cpf/?cpf=${cpf}&data=${encodeURIComponent(currentDate)}&token=${hubdevApiKey}`;
    
    console.log(`Calling HUBDev API: ${url.replace(hubdevApiKey, '[TOKEN_HIDDEN]')}`);
    
    // Criar AbortController com timeout de 10 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Lovable-API-Client/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HubDev API HTTP error: ${response.status}`);
      }

      const data = await response.json();
      
      const duration = Date.now() - startTime;
      console.log(`✅ [${new Date().toISOString()}] Resposta HubDev recebida em ${duration}ms`);
      console.log('HubDev API response:', JSON.stringify(data, null, 2));
    
    // Check if the API returned success
    if (data.return === "OK" && data.result) {
      // Format the birth date from DD/MM/YYYY to YYYY-MM-DD
      let formattedBirthDate = '';
      if (data.result.data_nascimento) {
        const birthDateParts = data.result.data_nascimento.split('/');
        if (birthDateParts.length === 3) {
          formattedBirthDate = `${birthDateParts[2]}-${birthDateParts[1].padStart(2, '0')}-${birthDateParts[0].padStart(2, '0')}`;
        }
      }
      
      return {
        success: true,
        data: {
          nome: data.result.nome_da_pf || '',
          nascimento: formattedBirthDate,
          cpf_numero: data.result.numero_de_cpf || '',
          situacao_cadastral: data.result.situacao_cadastral || '',
          data_inscricao: data.result.data_inscricao || '',
          comprovante_emitido: data.result.comprovante_emitido || ''
        }
      };
    } else {
      console.warn('HubDev API returned non-OK status:', data);
      return {
        success: false,
        error: 'CPF não encontrado na base da Receita Federal'
      };
    }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        const duration = Date.now() - startTime;
        console.error(`⏱️ [${new Date().toISOString()}] Timeout na consulta HubDev API após ${duration}ms`);
        return {
          success: false,
          error: 'Tempo esgotado ao consultar CPF. Tente novamente ou preencha manualmente.'
        };
      }
      throw fetchError;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${new Date().toISOString()}] Erro na consulta CPF após ${duration}ms:`, error);
    return {
      success: false,
      error: 'Erro ao consultar CPF na base da Receita Federal'
    };
  }
}

async function lookupCnpj(cnpj: string) {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);

    if (!response.ok) {
      throw new Error(`BrasilAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: {
        nome: data.nome_fantasia || data.razao_social,
        razao_social: data.razao_social,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cep: data.cep,
        municipio: data.municipio,
        uf: data.uf
      }
    };
  } catch (error) {
    console.error('CNPJ lookup error:', error);
    return {
      success: false,
      error: 'Erro ao consultar CNPJ'
    };
  }
}

async function lookupCep(cep: string) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!response.ok) {
      throw new Error(`ViaCEP error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.erro) {
      return {
        success: false,
        error: 'CEP não encontrado'
      };
    }
    
    return {
      success: true,
      data: {
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
        cep: data.cep
      }
    };
  } catch (error) {
    console.error('CEP lookup error:', error);
    return {
      success: false,
      error: 'Erro ao consultar CEP'
    };
  }
}