import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Download, Mail, Plus, Copy, AlertCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface SuccessStepProps {
  onAddNewUnit?: () => void;
  requestNumber?: string;
  requestType?: string;
  needsApproval?: boolean;
}

export const SuccessStep = ({ 
  onAddNewUnit, 
  requestNumber, 
  requestType,
  needsApproval = false 
}: SuccessStepProps) => {
  const navigate = useNavigate();

  const handleNewRegistration = () => {
    window.location.reload();
  };

  const handleCheckStatus = () => {
    navigate('/check-status');
  };

  const copyToClipboard = () => {
    if (requestNumber) {
      navigator.clipboard.writeText(requestNumber);
      toast.success('Número do protocolo copiado!');
    }
  };

  const getRequestTypeMessage = () => {
    switch (requestType) {
      case 'new_franchisee_new_unit':
        return 'Seu cadastro completo (franqueado + unidade)';
      case 'existing_franchisee_new_unit':
        return 'Sua nova unidade';
      case 'new_franchisee_existing_unit':
        return 'Seu cadastro como franqueado';
      default:
        return 'Seu cadastro';
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <Card className="border-success/20 bg-success/5">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-success rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {needsApproval ? 'Cadastro Enviado com Sucesso!' : 'Cadastro Realizado com Sucesso!'}
              </h1>
              <p className="text-lg text-muted-foreground">
                {needsApproval 
                  ? `${getRequestTypeMessage()} está em análise pela nossa equipe.` 
                  : 'Seus dados foram salvos e estão sendo processados pela nossa equipe.'}
              </p>
            </div>

            {/* Protocolo de Aprovação */}
            {needsApproval && requestNumber && (
              <Alert className="text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Protocolo de Acompanhamento</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">
                      Guarde este número para consultar o status do seu cadastro:
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="text-lg font-mono font-bold flex-1">
                        {requestNumber}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Informações sobre próximos passos */}
            {needsApproval && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 text-blue-900">📧 Próximos Passos</h3>
                  <ul className="text-sm text-blue-800 space-y-2 text-left">
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>Você receberá um email de confirmação</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>Nossa equipe analisará seu cadastro em até <strong>2 dias úteis</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>Você será notificado sobre a aprovação por email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>Você pode consultar o status a qualquer momento usando o protocolo</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {!needsApproval && (
                <p className="text-sm text-muted-foreground">
                  Caso tenha alguma dúvida ou precise atualizar suas informações, 
                  entre em contato conosco através do suporte.
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {needsApproval && (
                  <Button onClick={handleCheckStatus} variant="outline" className="gap-2">
                    <Search className="h-4 w-4" />
                    Consultar Status
                  </Button>
                )}
                {onAddNewUnit && !needsApproval && (
                  <Button onClick={onAddNewUnit} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Cadastrar Nova Unidade
                  </Button>
                )}
                <Button onClick={handleNewRegistration} variant="secondary">
                  Novo Cadastro Completo
                </Button>
                <Button 
                  onClick={() => window.open('https://girabot.com/', '_blank')}
                  variant="default"
                  className="gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Acessar Girabot
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};