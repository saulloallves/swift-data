import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { PersonalDataStep } from "@/components/onboarding/PersonalDataStep";
import { UnitDataStep } from "@/components/onboarding/UnitDataStep";
import { TermsStep } from "@/components/onboarding/TermsStep";
import { SuccessStep } from "@/components/onboarding/SuccessStep";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { useOnboardingForm, OnboardingFormData } from "@/hooks/useOnboardingForm";
import { useSearchParams } from "react-router-dom";
import logoCP from "@/assets/logo-cresci-perdi.png";

export type OnboardingStep = "welcome" | "personal" | "unit" | "terms" | "success";

const steps: Array<{ key: OnboardingStep; title: string; description: string }> = [
  { key: "personal", title: "Dados Pessoais", description: "Informações básicas e endereço pessoal" },
  { key: "unit", title: "Dados da Unidade", description: "Informações da unidade e endereço comercial" },
  { key: "terms", title: "Termos", description: "Aceite de termos e condições" },
  { key: "success", title: "Concluído", description: "Cadastro finalizado" },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isAddingNewUnit, setIsAddingNewUnit] = useState(false);
  const [searchParams] = useSearchParams();
  const { formData, updateFormData, submitForm, submitNewUnit, resetUnitData, isSubmitting, franchiseeId } = useOnboardingForm();

  // Check for saved state and URL parameters on component mount
  useEffect(() => {
    const stepParam = searchParams.get("step") as OnboardingStep;
    const savedFormData = localStorage.getItem("onboarding_form_data");
    const savedStep = localStorage.getItem("onboarding_current_step") as OnboardingStep;

    if (stepParam && savedFormData && savedStep) {
      // Restore form data from localStorage
      try {
        const parsedData = JSON.parse(savedFormData);
        // Use the complete object replacement instead of partial update
        updateFormData(parsedData);
        setCurrentStep(stepParam);
        
        // Clean up localStorage after restoring
        localStorage.removeItem("onboarding_form_data");
        localStorage.removeItem("onboarding_current_step");
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, [searchParams, updateFormData]);

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const progress = currentStep === "success" ? 100 : ((currentStepIndex + 1) / (steps.length - 1)) * 100;

  const handleNext = () => {
    if (currentStep === "welcome") {
      setCurrentStep("personal");
    } else if (currentStep === "personal") {
      setCurrentStep("unit");
    } else if (currentStep === "unit") {
      if (isAddingNewUnit) {
        // Se está adicionando nova unidade, vai direto para submissão
        handleSubmit();
      } else {
        setCurrentStep("terms");
      }
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
    const success = isAddingNewUnit ? await submitNewUnit() : await submitForm();
    if (success) {
      if (isAddingNewUnit) {
        // Reset state after successful new unit registration
        setIsAddingNewUnit(false);
      }
      setCurrentStep("success");
    }
  };

  const handleAddNewUnit = () => {
    resetUnitData();
    setIsAddingNewUnit(true);
    setCurrentStep("unit");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeStep onNext={handleNext} />;
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
            onPrevious={isAddingNewUnit ? undefined : handlePrevious}
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
        return <SuccessStep onAddNewUnit={franchiseeId ? handleAddNewUnit : undefined} />;
      default:
        return null;
    }
  };

  if (currentStep === "welcome" || currentStep === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {renderCurrentStep()}
      </div>
    );
  }

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
                className="h-20 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isAddingNewUnit ? "Cadastrar Nova Unidade" : "Cadastro de Franqueado"}
            </h1>
            <p className="text-muted-foreground">
              {isAddingNewUnit 
                ? "Cadastre uma nova unidade para o franqueado atual"
                : "Complete as informações para finalizar seu cadastro"
              }
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