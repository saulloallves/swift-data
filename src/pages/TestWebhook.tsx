import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const TestWebhook = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const testData = {
    id: "00000000-0000-0000-0000-000000000001", // UUID fictício para teste
    cpf: "47497662597", // CPF limpo (sem formatação)
    nome: "Vicente Davi Felipe Aragão",
    telefone: "84993954726", // Telefone limpo (sem formatação)
    // Dados completos para referência
    email: "vicente.davi.aragao@henrimar.com.br",
    data_nasc: "10/02/1968",
    cep: "59035-166",
    endereco: "2ª Vila Dois Irmãos",
    numero: "853",
    bairro: "Quintas",
    cidade: "Natal",
    estado: "RN",
  };

  const handleTestWebhook = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log("🧪 Iniciando teste de webhook com dados:", testData);

      const { data, error } = await supabase.functions.invoke(
        "notify-franchisee-created",
        {
          body: {
            cpf: testData.cpf,
            nome: testData.nome,
            telefone: testData.telefone,
            id: testData.id,
          },
        }
      );

      if (error) {
        console.error("❌ Erro ao chamar edge function:", error);
        setResult({
          success: false,
          message: `Erro: ${error.message}`,
          data: error,
        });
        toast.error("Falha ao enviar webhook");
      } else {
        console.log("✅ Edge function retornou:", data);
        setResult({
          success: true,
          message: "Webhook enviado com sucesso!",
          data,
        });
        toast.success("Webhook enviado com sucesso!");
      }
    } catch (error: any) {
      console.error("❌ Erro inesperado:", error);
      setResult({
        success: false,
        message: `Erro inesperado: ${error.message}`,
        data: error,
      });
      toast.error("Erro inesperado ao enviar webhook");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">🧪 Teste de Webhook n8n</CardTitle>
            <CardDescription>
              Teste o envio de dados para o webhook do n8n com dados fictícios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dados que serão enviados */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Dados Fictícios:</h3>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
                <p><span className="text-muted-foreground">ID:</span> {testData.id}</p>
                <p><span className="text-muted-foreground">Nome:</span> {testData.nome}</p>
                <p><span className="text-muted-foreground">CPF:</span> {testData.cpf}</p>
                <p><span className="text-muted-foreground">Telefone:</span> {testData.telefone}</p>
                <p><span className="text-muted-foreground">Email:</span> {testData.email}</p>
                <p><span className="text-muted-foreground">Data Nasc:</span> {testData.data_nasc}</p>
                <p><span className="text-muted-foreground">Endereço:</span> {testData.endereco}, {testData.numero}</p>
                <p><span className="text-muted-foreground">Bairro:</span> {testData.bairro}</p>
                <p><span className="text-muted-foreground">Cidade/UF:</span> {testData.cidade}/{testData.estado}</p>
                <p><span className="text-muted-foreground">CEP:</span> {testData.cep}</p>
              </div>
            </div>

            {/* Webhook URL */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Webhook URL:</h3>
              <code className="block bg-muted p-3 rounded-lg text-sm break-all">
                https://n8n.girabot.com.br/webhook-test/atualizar-senha-franqueado
              </code>
            </div>

            {/* Botão de teste */}
            <Button
              onClick={handleTestWebhook}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                "🚀 Enviar Teste para n8n"
              )}
            </Button>

            {/* Resultado */}
            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-2">
                    <AlertDescription className="font-semibold">
                      {result.message}
                    </AlertDescription>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                          Ver resposta completa
                        </summary>
                        <pre className="mt-2 bg-muted/50 p-3 rounded text-xs overflow-auto max-h-64">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            )}

            {/* Instruções */}
            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold">ℹ️ Instruções:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Clique no botão acima para testar o envio</li>
                <li>Verifique os logs do navegador (console) para mais detalhes</li>
                <li>Verifique os logs da Edge Function no Supabase</li>
                <li>Verifique se o webhook recebeu os dados no n8n</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Link para voltar */}
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <a href="/">← Voltar para Onboarding</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestWebhook;
