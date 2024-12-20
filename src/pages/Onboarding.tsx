import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { WelcomeStep } from "@/components/onboarding/steps/WelcomeStep";
import { LanguageStep } from "@/components/onboarding/steps/LanguageStep";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { VoiceStep } from "@/components/onboarding/steps/VoiceStep";
import { GoalsStep } from "@/components/onboarding/steps/GoalsStep";
import { ReviewStep } from "@/components/onboarding/steps/ReviewStep";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nativeLanguage: z.string().min(1, "Please select your native language"),
  targetLanguage: z.string().min(1, "Please select your target language"),
  voicePreference: z.enum(["male", "female", "nonBinary", "noPreference"]),
  goals: z.array(z.string()).min(1, "Please select at least one goal"),
  customGoals: z.array(z.string()).optional(),
});

const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const session = useSession();
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nativeLanguage: "",
      targetLanguage: "",
      voicePreference: "noPreference",
      goals: [],
      customGoals: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to complete onboarding",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          native_language: values.nativeLanguage,
          target_language: values.targetLanguage,
          voice_preference: values.voicePreference,
          learning_goals: values.goals,
          custom_goals: values.customGoals,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your profile has been updated successfully",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const TOTAL_STEPS = 5;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Dynamic background gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#38b6ff]/10 animate-gradient-shift" />
      <div className="fixed inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />
          </div>
          
          <div className="bg-background/50 backdrop-blur-sm border rounded-lg p-8 shadow-lg">
            {step === 1 && <WelcomeStep onNext={nextStep} />}
            
            {step === 2 && (
              <LanguageStep
                form={form}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}

            {step === 3 && (
              <VoiceStep
                form={form}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}

            {step === 4 && (
              <GoalsStep
                form={form}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}

            {step === 5 && (
              <ReviewStep
                form={form}
                onSubmit={onSubmit}
                onPrev={prevStep}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;