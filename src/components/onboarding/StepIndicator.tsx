import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  step: {
    key: string;
    title: string;
    description: string;
  };
  index: number;
  currentStep: string;
  isCompleted: boolean;
  isActive: boolean;
}

export const StepIndicator = ({ step, index, isCompleted, isActive }: StepIndicatorProps) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "step-indicator",
          isCompleted && "completed",
          isActive && "active",
          !isCompleted && !isActive && "inactive"
        )}
      >
        {isCompleted ? (
          <Check className="h-4 w-4" />
        ) : (
          <span>{index + 1}</span>
        )}
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-foreground">{step.title}</p>
        <p className="text-xs text-muted-foreground hidden sm:block">
          {step.description}
        </p>
      </div>
    </div>
  );
};