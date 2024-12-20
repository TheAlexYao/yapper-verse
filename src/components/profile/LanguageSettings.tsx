import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { LanguageSelector } from "../onboarding/steps/language/LanguageSelector";
import { languages } from "../onboarding/steps/language/languages";

interface LanguageSettingsProps {
  form: UseFormReturn<any>;
}

export function LanguageSettings({ form }: LanguageSettingsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Language Settings</h2>
      <div className="space-y-4">
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
                }}
                languages={languages}
                placeholder="Select your target language"
              />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}