import { useState } from "react";
import { RadioGroup } from "@/components/ui/radio-group";
import { VoiceOption } from "../onboarding/steps/voice/VoiceOption";
import { NoPreferenceOption } from "../onboarding/steps/voice/NoPreferenceOption";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VoiceSettingsProps {
  currentVoice: string | null;
  onVoiceChange: (voice: string) => void;
}

export function VoiceSettings({ currentVoice, onVoiceChange }: VoiceSettingsProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleVoiceChange = async (value: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) throw new Error("No user found");
        return supabase
          .from("profiles")
          .update({ voice_preference: value })
          .eq("id", user.id);
      });

      if (error) throw error;
      
      onVoiceChange(value);
      toast({
        title: "Success",
        description: "Voice preference updated successfully",
      });
    } catch (error) {
      console.error("Error updating voice preference:", error);
      toast({
        title: "Error",
        description: "Failed to update voice preference",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Voice Settings</h2>
      <RadioGroup
        onValueChange={handleVoiceChange}
        defaultValue={currentVoice || undefined}
        className="grid grid-cols-2 gap-4"
      >
        <VoiceOption value="male" label="Male Voice" />
        <VoiceOption value="female" label="Female Voice" />
        <NoPreferenceOption value={currentVoice || ""} />
      </RadioGroup>
    </section>
  );
}