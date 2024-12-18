import * as React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
  onPrev: () => void;
}

const languages = [
  { value: "en-US", label: "English", emoji: "🇺🇸" },
  { value: "zh-Hans", label: "Mandarin (Simplified)", emoji: "🇨🇳" },
  { value: "zh-Hant", label: "Mandarin (Traditional)", emoji: "🇹🇼" },
  { value: "yue-Hant", label: "Cantonese (Traditional)", emoji: "🇭🇰" },
  { value: "es-MX", label: "Spanish (Mexico)", emoji: "🇲🇽" },
  { value: "es-ES", label: "Spanish (Spain)", emoji: "🇪🇸" },
  { value: "fr-FR", label: "French (France)", emoji: "🇫🇷" },
  { value: "fr-CA", label: "French (Canada)", emoji: "🇨🇦" },
  { value: "pt-BR", label: "Portuguese (Brazil)", emoji: "🇧🇷" },
  { value: "pt-PT", label: "Portuguese (Portugal)", emoji: "🇵🇹" },
  { value: "ja-JP", label: "Japanese", emoji: "🇯🇵" },
  { value: "ko-KR", label: "Korean", emoji: "🇰🇷" },
  { value: "hi-IN", label: "Hindi", emoji: "🇮🇳" },
  { value: "ta-IN", label: "Tamil", emoji: "🇮🇳" },
  { value: "th-TH", label: "Thai", emoji: "🇹🇭" },
  { value: "vi-VN", label: "Vietnamese", emoji: "🇻🇳" },
  { value: "ms-MY", label: "Malay", emoji: "🇲🇾" },
  { value: "de-DE", label: "German", emoji: "🇩🇪" },
  { value: "ru-RU", label: "Russian", emoji: "🇷🇺" },
  { value: "it-IT", label: "Italian", emoji: "🇮🇹" },
  { value: "nl-NL", label: "Dutch", emoji: "🇳🇱" },
  { value: "pl-PL", label: "Polish", emoji: "🇵🇱" },
  { value: "sv-SE", label: "Swedish", emoji: "🇸🇪" },
  { value: "nb-NO", label: "Norwegian (Bokmål)", emoji: "🇳🇴" },
];

export function LanguageStep({ form, onNext, onPrev }: LanguageStepProps) {
  const [nativeOpen, setNativeOpen] = React.useState(false);
  const [targetOpen, setTargetOpen] = React.useState(false);
  
  const nativeLanguage = form.watch("nativeLanguage");
  const targetLanguage = form.watch("targetLanguage");

  // Set default value for native language if it's not already set
  React.useEffect(() => {
    if (!form.getValues("nativeLanguage")) {
      form.setValue("nativeLanguage", "en-US");
    }
  }, [form]);

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
                <Popover open={nativeOpen} onOpenChange={setNativeOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={nativeOpen}
                        className="w-full justify-between font-normal"
                      >
                        {field.value ? (
                          <>
                            <span className="mr-2">
                              {languages.find((lang) => lang.value === field.value)?.emoji}
                            </span>
                            {languages.find((lang) => lang.value === field.value)?.label}
                          </>
                        ) : (
                          "Select your native language"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search languages..." />
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-auto">
                        {languages.map((lang) => (
                          <CommandItem
                            key={lang.value}
                            value={lang.value}
                            onSelect={() => {
                              form.setValue("nativeLanguage", lang.value);
                              setNativeOpen(false);
                            }}
                            disabled={lang.value === targetLanguage}
                            className="flex items-center gap-2"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === lang.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="mr-2">{lang.emoji}</span>
                            {lang.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                <Popover open={targetOpen} onOpenChange={setTargetOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={targetOpen}
                        className="w-full justify-between font-normal"
                      >
                        {field.value ? (
                          <>
                            <span className="mr-2">
                              {languages.find((lang) => lang.value === field.value)?.emoji}
                            </span>
                            {languages.find((lang) => lang.value === field.value)?.label}
                          </>
                        ) : (
                          "Select your target language"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search languages..." />
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-auto">
                        {languages.map((lang) => (
                          <CommandItem
                            key={lang.value}
                            value={lang.value}
                            onSelect={() => {
                              form.setValue("targetLanguage", lang.value);
                              setTargetOpen(false);
                            }}
                            disabled={lang.value === nativeLanguage}
                            className="flex items-center gap-2"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === lang.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="mr-2">{lang.emoji}</span>
                            {lang.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
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