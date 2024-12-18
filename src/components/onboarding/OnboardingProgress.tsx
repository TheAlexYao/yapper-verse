import { Progress } from "@/components/ui/progress"

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-2">
      <Progress value={progress} className="h-2 bg-[#38b6ff]/20 [&>[role=progressbar]]:bg-[#38b6ff]" />
      <p className="text-sm text-muted-foreground text-center">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}