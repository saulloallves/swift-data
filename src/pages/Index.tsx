import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { PersonalDataStep } from "@/components/onboarding/PersonalDataStep";
import { UnitDataStep } from "@/components/onboarding/UnitDataStep";
import { TermsStep } from "@/components/onboarding/TermsStep";
import { SuccessStep } from "@/components/onboarding/SuccessStep";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";
import heroImage from "@/assets/onboarding-hero.jpg";

export type OnboardingStep = "personal" | "unit" | "terms" | "success";

const steps: Array<{ key: OnboardingStep; title: string; description: string }> = [
  { key: "personal", title: "Dados Pessoais", description: "Informações básicas e endereço pessoal" },
  { key: "unit", title: "Dados da Unidade", description: "Informações da unidade e endereço comercial" },
  { key: "terms", title: "Termos", description: "Aceite de termos e condições" },
  { key: "success", title: "Concluído", description: "Cadastro finalizado" },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("personal");
  const { formData, updateFormData, submitForm, isSubmitting } = useOnboardingForm();

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const progress = currentStep === "success" ? 100 : ((currentStepIndex + 1) / (steps.length - 1)) * 100;

  const handleNext = () => {
    if (currentStep === "personal") {
      setCurrentStep("unit");
    } else if (currentStep === "unit") {
      setCurrentStep("terms");
    } else if (currentStep === "terms") {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep === "unit") {
      setCurrentStep("personal");
    } else if (currentStep === "terms") {
      setCurrentStep("unit");
    }
  };

  const handleSubmit = async () => {
    const success = await submitForm();
    if (success) {
      setCurrentStep("success");
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "personal":
        return (
          <PersonalDataStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case "unit":
        return (
          <UnitDataStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case "terms":
        return (
          <TermsStep
            data={formData}
            onUpdate={updateFormData}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
            isSubmitting={isSubmitting}
          />
        );
      case "success":
        return <SuccessStep />;
      default:
        return null;
    }
  };

  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <SuccessStep />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background relative"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay for readability */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Cadastro de Franqueado
            </h1>
            <p className="text-muted-foreground">
              Complete as informações para finalizar seu cadastro
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.slice(0, -1).map((step, index) => (
                <StepIndicator
                  key={step.key}
                  step={step}
                  index={index}
                  currentStep={currentStep}
                  isCompleted={currentStepIndex > index}
                  isActive={currentStep === step.key}
                />
              ))}
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
                {steps[currentStepIndex]?.title}
              </CardTitle>
              <CardDescription>
                {steps[currentStepIndex]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCurrentStep()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;