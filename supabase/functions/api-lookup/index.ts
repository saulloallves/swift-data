import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LookupRequest {
  type: 'cpf' | 'cnpj' | 'cep';
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
      default:
        throw new Error('Invalid lookup type');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in api-lookup function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

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

  try {
    const response = await fetch(`https://api.hubdev.com.br/v2/cpf/${cpf}`, {
      headers: {
        'Authorization': `Bearer ${hubdevApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HubDev API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: {
        nome: data.nome,
        nascimento: data.nascimento
      }
    };
  } catch (error) {
    console.error('CPF lookup error:', error);
    return {
      success: false,
      error: 'Erro ao consultar CPF'
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