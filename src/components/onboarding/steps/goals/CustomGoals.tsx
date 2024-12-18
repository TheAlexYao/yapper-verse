import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface CustomGoalsProps {
  form: UseFormReturn<any>;
  customGoals: string[];
  setCustomGoals: (goals: string[]) => void;
}

export function CustomGoals({ form, customGoals, setCustomGoals }: CustomGoalsProps) {
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
    <div className="space-y-4">
      <FormLabel>Something else you'd like to focus on?</FormLabel>
      <div className="flex gap-2">
        <Input 
          value={newCustomGoal}
          onChange={(e) => setNewCustomGoal(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 min-w-0" // Added min-w-0 to prevent text overflow
          placeholder="Tell us about your specific learning goals..."
        />
        <Button 
          type="button"
          onClick={handleAddCustomGoal}
          className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 shrink-0" // Added shrink-0
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
                    <span className="break-words flex-1">{goal}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCustomGoal(index)}
                      className="h-8 w-8 p-0 shrink-0"
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
  );
}