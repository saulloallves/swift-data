import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bem-vindo ao Cadastro de Franqueados!</CardTitle>
          <CardDescription>
            Olá! Este é o sistema de cadastro para novos franqueados e seus sócios.
            Vamos guiá-lo em algumas etapas para coletar todas as informações necessárias.
            O processo é simples e rápido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>IMPORTANTE</AlertTitle>
            <AlertDescription>
              Este formulário destina-se exclusivamente ao franqueado principal e seus sócios.
              Ele não deve ser preenchido por funcionários da unidade.
            </AlertDescription>
          </Alert>
          <Button onClick={onNext} className="w-full" size="lg">
            Iniciar Cadastro
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};