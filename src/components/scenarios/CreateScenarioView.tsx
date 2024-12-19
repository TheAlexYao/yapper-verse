import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Scenario } from "@/pages/ScenarioHub";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface CreateScenarioViewProps {
  onScenarioCreated: (scenario: Scenario) => void;
}

const EXAMPLE_PROMPTS = [
  "I want to learn how to negotiate prices at a local market",
  "Help me practice ordering food at a fancy restaurant",
  "I need to learn how to give directions to a taxi driver",
];

export function CreateScenarioView({ onScenarioCreated }: CreateScenarioViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const completedCount = 3; // Replace with actual completed count
  const form = useForm({
    defaultValues: {
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
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="text-lg">What would you like to practice?</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          className="p-0 h-auto hover:bg-transparent"
                        >
                          <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-2 text-base">Example prompts:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {EXAMPLE_PROMPTS.map((prompt, index) => (
                            <li key={index} className="text-sm">{prompt}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  {...field}
                  placeholder="E.g., I want to learn how to negotiate at a market..."
                  className="h-32 text-base"
                />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 text-lg py-6"
          >
            {isGenerating ? "Generating..." : "Generate Scenario"}
          </Button>
        </form>
      </Form>

      {/* Minimalist Counter */}
      <div className="flex items-center justify-center mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2">
            <span role="img" aria-label="celebration" className="text-2xl">🎉</span>
            <h4 className="text-xl font-semibold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
              Scenarios Completed: {completedCount}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}