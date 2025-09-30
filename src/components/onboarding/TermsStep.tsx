import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, Shield, UserCheck, ExternalLink } from "lucide-react";
import { OnboardingFormData } from "@/hooks/useOnboardingForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { termsData } from "@/data/termsData";

interface TermsStepProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onSubmit: () => void;
  onPrevious: () => void;
  isSubmitting: boolean;
}

export const TermsStep = ({ data, onUpdate, onSubmit, onPrevious, isSubmitting }: TermsStepProps) => {
  const navigate = useNavigate();

  // Check for accepted terms in localStorage on component mount
  useEffect(() => {
    const systemAccepted = localStorage.getItem("term_accepted_system") === "true";
    const confidentialityAccepted = localStorage.getItem("term_accepted_confidentiality") === "true";
    const lgpdAccepted = localStorage.getItem("term_accepted_lgpd") === "true";

    if (systemAccepted && !data.system_term_accepted) {
      onUpdate({ system_term_accepted: true });
      localStorage.removeItem("term_accepted_system");
    }
    if (confidentialityAccepted && !data.confidentiality_term_accepted) {
      onUpdate({ confidentiality_term_accepted: true });
      localStorage.removeItem("term_accepted_confidentiality");
    }
    if (lgpdAccepted && !data.lgpd_term_accepted) {
      onUpdate({ lgpd_term_accepted: true });
      localStorage.removeItem("term_accepted_lgpd");
    }
  }, [data, onUpdate]);

  const handleSubmit = () => {
    if (!data.system_term_accepted || !data.confidentiality_term_accepted || !data.lgpd_term_accepted) {
      toast.error("Você deve aceitar todos os termos para continuar");
      return;
    }
    onSubmit();
  };

  const handleTermClick = (termKey: string) => {
    // Save current form data and step to localStorage before navigating
    localStorage.setItem("onboarding_form_data", JSON.stringify(data));
    localStorage.setItem("onboarding_current_step", "terms");
    
    navigate(`/terms/${termKey}?return=${encodeURIComponent("/?step=terms")}`);
  };

  const allTermsAccepted = data.system_term_accepted && data.confidentiality_term_accepted && data.lgpd_term_accepted;

  return (
    <div className="form-section">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Termos e Condições
          </h2>
          <p className="text-muted-foreground">
            Leia e aceite os termos abaixo para finalizar seu cadastro
          </p>
        </div>

        <Card className="border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">Termo de Uso do Sistema</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Aceito os termos de uso da plataforma e sistema de gestão da franquia
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-2 text-primary hover:text-primary/80"
                      onClick={() => handleTermClick("system")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ler termo completo
                    </Button>
                  </div>
                  <Checkbox
                    id="system_term"
                    checked={data.system_term_accepted}
                    onCheckedChange={(checked) => onUpdate({ system_term_accepted: checked as boolean })}
                    className="flex-shrink-0 mt-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">Termo de Confidencialidade</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Comprometo-me a manter sigilo sobre informações confidenciais da franquia
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-2 text-primary hover:text-primary/80"
                      onClick={() => handleTermClick("confidentiality")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ler termo completo
                    </Button>
                  </div>
                  <Checkbox
                    id="confidentiality_term"
                    checked={data.confidentiality_term_accepted}
                    onCheckedChange={(checked) => onUpdate({ confidentiality_term_accepted: checked as boolean })}
                    className="flex-shrink-0 mt-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">Termo LGPD</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Autorizo o tratamento dos meus dados pessoais conforme a Lei Geral de Proteção de Dados
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-2 text-primary hover:text-primary/80"
                      onClick={() => handleTermClick("lgpd")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ler termo completo
                    </Button>
                  </div>
                  <Checkbox
                    id="lgpd_term"
                    checked={data.lgpd_term_accepted}
                    onCheckedChange={(checked) => onUpdate({ lgpd_term_accepted: checked as boolean })}
                    className="flex-shrink-0 mt-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/30 rounded-lg p-4 border">
          <p className="text-sm text-muted-foreground">
            Ao aceitar os termos acima, você confirma que leu e concorda com todas as condições estabelecidas. 
            Seus dados serão tratados com segurança e utilizados exclusivamente para os fins relacionados à franquia.
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={onPrevious} variant="outline" disabled={isSubmitting}>
          Anterior
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!allTermsAccepted || isSubmitting}
          className="px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Finalizando...
            </>
          ) : (
            "Finalizar Cadastro"
          )}
        </Button>
      </div>
    </div>
  );
};