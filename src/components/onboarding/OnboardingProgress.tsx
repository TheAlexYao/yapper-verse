import { Progress } from "@/components/ui/progress"

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-2">
      <Progress value={progress} className="h-2 bg-[#7843e6]/20 [&>[role=progressbar]]:bg-gradient-to-r [&>[role=progressbar]]:from-[#38b6ff] [&>[role=progressbar]]:to-[#7843e6]" />
      <p className="text-sm text-muted-foreground text-center">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}