import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";

interface LanguageStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
  onPrev: () => void;
}

const languages = [
  { value: "en", label: "English" },
  { value: "zh_hans", label: "Mandarin (Simplified)" },
  { value: "zh_hant", label: "Mandarin (Traditional)" },
  { value: "yue", label: "Cantonese (Traditional)" },
  { value: "es_mx", label: "Spanish (Mexico)" },
  { value: "es_es", label: "Spanish (Spain)" },
  { value: "fr_fr", label: "French (France)" },
  { value: "fr_ca", label: "French (Canada)" },
  { value: "pt_br", label: "Portuguese (Brazil)" },
  { value: "pt_pt", label: "Portuguese (Portugal)" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "th", label: "Thai" },
  { value: "vi", label: "Vietnamese" },
  { value: "ms", label: "Malay" },
  { value: "de", label: "German" },
  { value: "ru", label: "Russian" },
  { value: "it", label: "Italian" },
  { value: "nl", label: "Dutch" },
  { value: "pl", label: "Polish" },
  { value: "sv", label: "Swedish" },
  { value: "nb", label: "Norwegian (Bokmål)" },
];

export function LanguageStep({ form, onNext, onPrev }: LanguageStepProps) {
  const nativeLanguage = form.watch("nativeLanguage");
  const targetLanguage = form.watch("targetLanguage");

  const handleNext = () => {
    const isValid = form.trigger(["nativeLanguage", "targetLanguage"]);
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Pick Your Languages</h2>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your native language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem 
                        key={lang.value} 
                        value={lang.value}
                        disabled={lang.value === targetLanguage}
                      >
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your target language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem 
                        key={lang.value} 
                        value={lang.value}
                        disabled={lang.value === nativeLanguage}
                      >
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        <Button onClick={handleNext} className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90">Next</Button>
      </div>
    </div>
  );
}