import { Form, FormField, FormItem } from "@/components/ui/form";
import { RadioGroup } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { InfoTooltip } from "./voice/InfoTooltip";
import { VoiceOption } from "./voice/VoiceOption";
import { NoPreferenceOption } from "./voice/NoPreferenceOption";

interface VoiceStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
  onPrev: () => void;
}

export function VoiceStep({ form, onNext, onPrev }: VoiceStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
          Personalize your own character's voice
        </h2>
        <p className="text-muted-foreground">
          The people you meet in Yapper will sound authentic and nuanced. Choose a voice style that feels right for you—it might subtly influence how characters address you, reflecting cultural norms and conversation patterns in your chosen language.
        </p>
        <InfoTooltip />
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="voicePreference"
            render={({ field }) => (
              <FormItem>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <VoiceOption value="male" label="Male Voice" />
                  <VoiceOption value="female" label="Female Voice" />
                  <NoPreferenceOption value={field.value} />
                </RadioGroup>
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90">
          Next
        </Button>
      </div>
    </div>
  );
}