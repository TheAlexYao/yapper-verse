import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

interface PredefinedGoalsProps {
  form: UseFormReturn<any>;
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

export function PredefinedGoals({ form }: PredefinedGoalsProps) {
  return (
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
        </FormItem>
      )}
    />
  );
}