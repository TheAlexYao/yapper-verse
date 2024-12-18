import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { Flag } from "lucide-react";

interface LanguageStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
  onPrev: () => void;
}

const languages = [
  { value: "en-US", label: "English", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "zh-Hans", label: "Mandarin (Simplified)", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "zh-Hant", label: "Mandarin (Traditional)", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "yue-Hant", label: "Cantonese (Traditional)", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "es-MX", label: "Spanish (Mexico)", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "es-ES", label: "Spanish (Spain)", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "fr-FR", label: "French (France)", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "fr-CA", label: "French (Canada)", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "pt-BR", label: "Portuguese (Brazil)", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "pt-PT", label: "Portuguese (Portugal)", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "ja-JP", label: "Japanese", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "ko-KR", label: "Korean", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "hi-IN", label: "Hindi", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "ta-IN", label: "Tamil", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "th-TH", label: "Thai", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "vi-VN", label: "Vietnamese", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "ms-MY", label: "Malay", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "de-DE", label: "German", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "ru-RU", label: "Russian", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "it-IT", label: "Italian", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "nl-NL", label: "Dutch", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "pl-PL", label: "Polish", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "sv-SE", label: "Swedish", icon: <Flag className="w-4 h-4 mr-2" /> },
  { value: "nb-NO", label: "Norwegian (Bokmål)", icon: <Flag className="w-4 h-4 mr-2" /> },
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
                        className="flex items-center"
                      >
                        {lang.icon}
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
                        className="flex items-center"
                      >
                        {lang.icon}
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