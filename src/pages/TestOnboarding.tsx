import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

const TestOnboarding = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    setLoading(true);
    setResult(null);
    console.log('🏥 Testando Health Check...');
    
    try {
      const response = await fetch(
        'https://zqexpclhdrbnevxheiax.supabase.co/functions/v1/onboarding-submit',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      );
      
      const data = await response.json();
      console.log('✅ Health Check Response:', data);
      
      setResult({ 
        type: 'health-check', 
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Health Check Error:', error);
      setResult({ 
        type: 'health-check',
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testSubmitForm = async () => {
    setLoading(true);
    setResult(null);
    console.log('📝 Testando Submit Form...');
    
    try {
      const { data, error } = await supabase.functions.invoke('onboarding-submit', {
        body: {
          action: 'submitForm',
          formData: {
            cpf_rnm: '12345678901',
            full_name: 'Teste Sistema Debug',
            contact: '11999999999',
            owner_type: 'Sócio',
            group_code: 9999,
            group_name: 'Unidade Teste Debug',
            store_model: 'Franquia',
            store_phase: 'operacao',
            system_term_accepted: true,
            confidentiality_term_accepted: true,
            lgpd_term_accepted: true,
            has_parking: false,
            has_partner_parking: false,
            purchases_active: true,
            sales_active: true,
            was_entrepreneur: false,
            has_other_activities: false,
            was_referred: false,
            receives_prolabore: false
          }
        }
      });
      
      console.log('📥 Submit Form Response:', { data, error });
      
      setResult({ 
        type: 'submit-form',
        success: !error && data?.success,
        data, 
        error,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Submit Form Error:', error);
      setResult({ 
        type: 'submit-form',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testLinkExistingUnit = async () => {
    setLoading(true);
    setResult(null);
    console.log('🔗 Testando Link Existing Unit...');
    
    try {
      const { data, error } = await supabase.functions.invoke('onboarding-submit', {
        body: {
          action: 'submitForm',
          formData: {
            cpf_rnm: '12345678901',
            full_name: 'Teste Link Unidade',
            contact: '11999999999',
            owner_type: 'Sócio',
            system_term_accepted: true,
            confidentiality_term_accepted: true,
            lgpd_term_accepted: true,
            was_entrepreneur: false,
            has_other_activities: false,
            was_referred: false,
            receives_prolabore: false,
            _linking_existing_unit: true,
            _existing_unit_id: '03baff0e-d211-4c7b-b769-a3d390d24074' // ID de exemplo
          }
        }
      });
      
      console.log('📥 Link Existing Unit Response:', { data, error });
      
      setResult({ 
        type: 'link-existing-unit',
        success: !error && data?.success,
        data, 
        error,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Link Existing Unit Error:', error);
      setResult({ 
        type: 'link-existing-unit',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            🧪 Test Onboarding Edge Function
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ferramenta de diagnóstico para validar o sistema de onboarding
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Botões de Teste */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={testHealthCheck} 
              disabled={loading}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-1">🏥</span>
              <span>Health Check</span>
            </Button>
            
            <Button 
              onClick={testSubmitForm} 
              disabled={loading}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-1">📝</span>
              <span>Test Submit Form</span>
            </Button>
            
            <Button 
              onClick={testLinkExistingUnit} 
              disabled={loading}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-1">🔗</span>
              <span>Test Link Unit</span>
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="ml-3 text-muted-foreground">Aguardando resposta...</span>
            </div>
          )}

          {/* Resultado */}
          {result && !loading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {result.success ? '✅' : '❌'}
                </span>
                <h3 className="text-lg font-semibold">
                  {result.success ? 'Sucesso' : 'Erro'}
                </h3>
                <span className="text-sm text-muted-foreground ml-auto">
                  {new Date(result.timestamp).toLocaleTimeString('pt-BR')}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tipo:</span>
                  <span className="text-sm text-muted-foreground">{result.type}</span>
                </div>
              </div>

              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <pre className="text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}

          {/* Instruções */}
          {!result && !loading && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="font-semibold mb-2">📋 Instruções:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <strong>Health Check:</strong> Verifica se a Edge Function está ativa e com secrets configurados</li>
                <li>• <strong>Test Submit Form:</strong> Testa cadastro completo de franqueado + unidade</li>
                <li>• <strong>Test Link Unit:</strong> Testa vinculação de franqueado a unidade existente</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                ⚠️ <strong>Importante:</strong> Todos os logs são exibidos no console do navegador
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestOnboarding;
