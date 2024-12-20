import * as React from "react";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { LanguageSelector } from "./language/LanguageSelector";
import { languages } from "./language/languages";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LanguageStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
  onPrev: () => void;
}

export function LanguageStep({ form, onNext, onPrev }: LanguageStepProps) {
  const nativeLanguage = form.watch("nativeLanguage");
  const targetLanguage = form.watch("targetLanguage");
  const { toast } = useToast();

  // Set default value for native language if it's not already set
  React.useEffect(() => {
    if (!form.getValues("nativeLanguage")) {
      form.setValue("nativeLanguage", "en-US");
    }
  }, [form]);

  const handleNext = async () => {
    const isValid = await form.trigger(["nativeLanguage", "targetLanguage"]);
    if (!isValid) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Update the languages_learning array to include the target language
      const { error } = await supabase
        .from('profiles')
        .update({ 
          languages_learning: [targetLanguage],
          target_language: targetLanguage,
          native_language: nativeLanguage
        })
        .eq('id', user.id);

      if (error) throw error;
      onNext();
    } catch (error) {
      console.error('Error updating languages:', error);
      toast({
        title: "Error",
        description: "Failed to save language preferences",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
        Pick Your Languages
      </h2>
      <p className="text-muted-foreground">
        Choose your home base (native language) and where you'd like to go next (target language).
      </p>
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="nativeLanguage"
            rules={{ 
              required: "Please select your native language",
              validate: (value) => 
                value !== targetLanguage || "Native and target languages must be different"
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Native Language</FormLabel>
                <LanguageSelector
                  value={field.value}
                  onSelect={(value) => form.setValue("nativeLanguage", value)}
                  languages={languages}
                  otherSelectedValue={targetLanguage}
                  placeholder="Select your native language"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetLanguage"
            rules={{ 
              required: "Please select your target language",
              validate: (value) => 
                value !== nativeLanguage || "Native and target languages must be different"
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Language</FormLabel>
                <LanguageSelector
                  value={field.value}
                  onSelect={(value) => form.setValue("targetLanguage", value)}
                  languages={languages}
                  otherSelectedValue={nativeLanguage}
                  placeholder="Select your target language"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
        >
          Next
        </Button>
      </div>
    </div>
  );
}