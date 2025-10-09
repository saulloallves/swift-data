import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { getTermByKey } from "@/data/termsData";
import logoCP from "@/assets/logo-cresci-perdi.png";
import { toast } from "sonner";

const Terms = () => {
  const { termType } = useParams<{ termType: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("return") || "/";

  const termData = termType ? getTermByKey(termType) : undefined;

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  if (!termData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Termo não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              O termo solicitado não foi encontrado.
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAcceptTerm = () => {
    // Store acceptance in localStorage to be picked up by TermsStep
    localStorage.setItem(`term_accepted_${termData.key}`, "true");
    toast.success("Termo aceito com sucesso!");
    navigate(returnUrl);
  };

  const IconComponent = termData.icon;

  // Format content with proper line breaks and sections
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0">
            {line.replace('## ', '')}
          </h3>
        );
      } else if (line.startsWith('• ')) {
        return (
          <li key={index} className="text-muted-foreground ml-4 mb-1">
            {line.replace('• ', '')}
          </li>
        );
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return (
          <p key={index} className="text-muted-foreground mb-2 leading-relaxed">
            {line}
          </p>
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6 flex flex-col items-center gap-4">
              <img 
                src={logoCP} 
                alt="Cresci e Perdi" 
                className="h-16 w-auto"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <span>Cadastro</span>
              <span>›</span>
              <span>Termos</span>
              <span>›</span>
              <span className="text-primary font-medium">{termData.title}</span>
            </div>
          </div>

          {/* Terms Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <IconComponent className="h-6 w-6 text-primary" />
                {termData.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="space-y-2">
                {formatContent(termData.content)}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-between">
            <Button 
              onClick={() => navigate(returnUrl)} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Cadastro
            </Button>
            
            <Button 
              onClick={handleAcceptTerm}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Aceitar Termo
            </Button>
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg border">
            <p className="text-sm text-muted-foreground text-center">
              Ao aceitar este termo, você confirma que leu e compreendeu todas as condições estabelecidas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;