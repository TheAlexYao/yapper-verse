import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSelector } from "@/components/onboarding/steps/language/LanguageSelector";
import { languages } from "@/components/onboarding/steps/language/languages";
import { Scenario } from "@/pages/ScenarioHub";

interface CreateScenarioViewProps {
  onScenarioCreated: (scenario: Scenario) => void;
}

export function CreateScenarioView({ onScenarioCreated }: CreateScenarioViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const form = useForm({
    defaultValues: {
      nativeLanguage: "",
      targetLanguage: "",
      prompt: "",
    },
  });

  const onSubmit = async (values: any) => {
    setIsGenerating(true);
    // Simulate API call - replace with real API call later
    setTimeout(() => {
      const mockGeneratedScenario: Scenario = {
        id: Date.now().toString(),
        title: "Generated Scenario",
        description: `A scenario based on: ${values.prompt}`,
        category: "Custom",
        primaryGoal: "Custom goal based on prompt",
        usefulPhrases: ["Phrase 1", "Phrase 2"],
        culturalNotes: "Generated cultural notes",
        locationDetails: "Generated location details",
        isBookmarked: false,
      };
      onScenarioCreated(mockGeneratedScenario);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nativeLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Native Language</FormLabel>
                <LanguageSelector
                  value={field.value}
                  onSelect={(value) => form.setValue("nativeLanguage", value)}
                  languages={languages}
                  placeholder="Select your native language"
                  otherSelectedValue={form.watch("targetLanguage")}
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
                  onSelect={(value) => form.setValue("targetLanguage", value)}
                  languages={languages}
                  placeholder="Select your target language"
                  otherSelectedValue={form.watch("nativeLanguage")}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What would you like to practice?</FormLabel>
                <Textarea
                  {...field}
                  placeholder="E.g., I want to learn how to negotiate at a market..."
                  className="h-32"
                />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
          >
            {isGenerating ? "Generating..." : "Generate Scenario"}
          </Button>
        </form>
      </Form>
    </div>
  );
}