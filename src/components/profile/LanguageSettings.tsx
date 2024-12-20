import { useEffect, useState } from "react";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { LanguageSelector } from "../onboarding/steps/language/LanguageSelector";
import { languages } from "../onboarding/steps/language/languages";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LanguageSettingsProps {
  form: UseFormReturn<any>;
}

export function LanguageSettings({ form }: LanguageSettingsProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleLanguageChange = async (field: string, value: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) throw new Error("No user found");
        return supabase
          .from("profiles")
          .update({ [field]: value })
          .eq("id", user.id);
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Language preference updated successfully",
      });
    } catch (error) {
      console.error("Error updating language:", error);
      toast({
        title: "Error",
        description: "Failed to update language preference",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Language Settings</h2>
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="nativeLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Native Language</FormLabel>
                <LanguageSelector
                  value={field.value}
                  onSelect={(value) => {
                    field.onChange(value);
                    handleLanguageChange("native_language", value);
                  }}
                  languages={languages}
                  placeholder="Select your native language"
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Language</FormLabel>
                <LanguageSelector
                  value={field.value}
                  onSelect={(value) => {
                    field.onChange(value);
                    handleLanguageChange("target_language", value);
                  }}
                  languages={languages}
                  placeholder="Select your target language"
                />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </section>
  );
}