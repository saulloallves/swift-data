import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Download, Mail } from "lucide-react";

export const SuccessStep = () => {
  const handleNewRegistration = () => {
    window.location.reload();
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
                Cadastro Realizado com Sucesso!
              </h1>
              <p className="text-lg text-muted-foreground">
                Seus dados foram salvos e estão sendo processados pela nossa equipe.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Próximos Passos
              </h2>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">
                    Você receberá um e-mail de confirmação em breve
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">
                    Nossa equipe entrará em contato para os próximos passos
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <ArrowRight className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">
                    O processo de onboarding será iniciado dentro de 24h
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Caso tenha alguma dúvida ou precise atualizar suas informações, 
                entre em contato conosco através do suporte.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleNewRegistration} variant="outline">
                  Novo Cadastro
                </Button>
                <Button>
                  Ir para Suporte
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};