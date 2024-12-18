import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Plus, X } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";

interface GoalsStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
  onPrev: () => void;
}

const goals = [
  {
    id: "improve-pronunciation",
    label: "Improve Pronunciation",
    description: "Refine your accent so you're easily understood when asking for directions or making small talk",
  },
  {
    id: "travel-phrases",
    label: "Learn Travel Phrases",
    description: "Handle everyday situations—ordering a meal, checking into a hotel, buying train tickets—like a savvy traveler",
  },
  {
    id: "formal-conversations",
    label: "Master Formal Conversations",
    description: "Handle professional or polite scenarios, such as meeting clients, attending a family gathering, or discussing business over dinner",
  },
  {
    id: "casual-speech",
    label: "Casual, Everyday Speech",
    description: "Pick up the local slang, humor, and small talk that makes you blend in naturally",
  },
];

export function GoalsStep({ form, onNext, onPrev }: GoalsStepProps) {
  const [customGoals, setCustomGoals] = useState<string[]>(form.getValues().customGoals || []);
  const [isCustomGoalsExpanded, setIsCustomGoalsExpanded] = useState(false);
  const [newCustomGoal, setNewCustomGoal] = useState("");

  const handleAddCustomGoal = () => {
    if (newCustomGoal.trim()) {
      const updatedGoals = [...customGoals, newCustomGoal.trim()];
      setCustomGoals(updatedGoals);
      form.setValue("customGoals", updatedGoals);
      setNewCustomGoal("");
    }
  };

  const handleRemoveCustomGoal = (index: number) => {
    const updatedGoals = customGoals.filter((_, i) => i !== index);
    setCustomGoals(updatedGoals);
    form.setValue("customGoals", updatedGoals);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomGoal();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
          What Do You Want Out of These Conversations?
        </h2>
        <p className="text-muted-foreground">
          Are you hoping to confidently order street food, strike up conversations with locals at a café, 
          impress colleagues during a business trip, or navigate a new city without feeling lost? 
          Tell us what matters most, and we'll shape your experience around those authentic moments.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="goals"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((goal) => (
                    <FormField
                      key={goal.id}
                      control={form.control}
                      name="goals"
                      render={({ field }) => {
                        const isChecked = field.value?.includes(goal.id);
                        const handleChange = (checked: boolean) => {
                          const newValue = checked
                            ? [...(field.value || []), goal.id]
                            : field.value?.filter((value: string) => value !== goal.id);
                          field.onChange(newValue);
                        };

                        return (
                          <FormItem
                            key={goal.id}
                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:border-[#38b6ff] transition-colors"
                            onClick={(e) => {
                              if (!(e.target as HTMLElement).closest('.checkbox-wrapper')) {
                                handleChange(!isChecked);
                              }
                            }}
                          >
                            <div className="flex flex-1 items-start space-x-3">
                              <FormControl>
                                <div className="checkbox-wrapper">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={handleChange}
                                    className="border-[#38b6ff] data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#38b6ff] data-[state=checked]:to-[#7843e6]"
                                  />
                                </div>
                              </FormControl>
                              <div className="space-y-1 leading-none flex-1">
                                <FormLabel className="text-base">
                                  {goal.label}
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  {goal.description}
                                </p>
                              </div>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Something else you'd like to focus on?</FormLabel>
            <div className="flex gap-2">
              <Input 
                value={newCustomGoal}
                onChange={(e) => setNewCustomGoal(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                placeholder="Tell us about your specific learning goals..."
              />
              <Button 
                type="button"
                onClick={handleAddCustomGoal}
                className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {customGoals.length > 0 && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCustomGoalsExpanded(!isCustomGoalsExpanded)}
                  className="text-sm"
                >
                  {isCustomGoalsExpanded ? "Hide" : "Show"} Custom Goals ({customGoals.length})
                </Button>

                {isCustomGoalsExpanded && (
                  <Card className="p-4">
                    <ul className="space-y-2">
                      {customGoals.map((goal, index) => (
                        <li key={index} className="flex items-center justify-between gap-2 p-2 rounded-md bg-secondary/50">
                          <span>{goal}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCustomGoal(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}
          </div>
        </form>
      </Form>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground cursor-help">
              <HelpCircle className="h-4 w-4" />
              <span>Why are we asking about your goals?</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            Your chosen goals will influence what Yapper prioritizes. Want to navigate a farmers' market like a regular? 
            We've got you. Craving deeper chats with friends abroad? Just say the word.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
        >
          Next
        </Button>
      </div>
    </div>
  );
}