import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";

interface GoalsStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
  onPrev: () => void;
}

const goals = [
  {
    id: "casual-conversation",
    label: "Casual Conversation",
    description: "Practice everyday conversations and small talk",
  },
  {
    id: "business-communication",
    label: "Business Communication",
    description: "Learn professional language and business etiquette",
  },
  {
    id: "academic-language",
    label: "Academic Language",
    description: "Study academic vocabulary and formal writing",
  },
  {
    id: "cultural-exchange",
    label: "Cultural Exchange",
    description: "Learn about customs, traditions, and cultural nuances",
  },
];

export function GoalsStep({ form, onNext, onPrev }: GoalsStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Set Your Learning Goals</h2>
      <p className="text-muted-foreground">
        Choose what you'd like to focus on in your language learning journey.
      </p>
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
                        return (
                          <FormItem
                            key={goal.id}
                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:border-[#38b6ff] transition-colors"
                          >
                            <FormControl>
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), goal.id]
                                    : field.value?.filter((value: string) => value !== goal.id);
                                  field.onChange(newValue);
                                }}
                                className="border-[#38b6ff] data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#38b6ff] data-[state=checked]:to-[#7843e6]"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base">
                                {goal.label}
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                {goal.description}
                              </p>
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
        </form>
      </Form>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90">
          Next
        </Button>
      </div>
    </div>
  );
}