import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, Shield, UserCheck } from "lucide-react";
import { OnboardingFormData } from "@/hooks/useOnboardingForm";
import { toast } from "sonner";

interface TermsStepProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onSubmit: () => void;
  onPrevious: () => void;
  isSubmitting: boolean;
}

export const TermsStep = ({ data, onUpdate, onSubmit, onPrevious, isSubmitting }: TermsStepProps) => {
  const handleSubmit = () => {
    if (!data.system_term_accepted || !data.confidentiality_term_accepted || !data.lgpd_term_accepted) {
      toast.error("Você deve aceitar todos os termos para continuar");
      return;
    }
    onSubmit();
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
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Termo de Uso do Sistema</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Aceito os termos de uso da plataforma e sistema de gestão da franquia
                    </p>
                  </div>
                  <Checkbox
                    id="system_term"
                    checked={data.system_term_accepted}
                    onCheckedChange={(checked) => onUpdate({ system_term_accepted: checked as boolean })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Termo de Confidencialidade</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Comprometo-me a manter sigilo sobre informações confidenciais da franquia
                    </p>
                  </div>
                  <Checkbox
                    id="confidentiality_term"
                    checked={data.confidentiality_term_accepted}
                    onCheckedChange={(checked) => onUpdate({ confidentiality_term_accepted: checked as boolean })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <UserCheck className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Termo LGPD</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Autorizo o tratamento dos meus dados pessoais conforme a Lei Geral de Proteção de Dados
                    </p>
                  </div>
                  <Checkbox
                    id="lgpd_term"
                    checked={data.lgpd_term_accepted}
                    onCheckedChange={(checked) => onUpdate({ lgpd_term_accepted: checked as boolean })}
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