import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LearningGoalsProps {
  learningGoals: string[];
  customGoals: string[];
  onGoalsUpdate: (goals: string[], type: 'learning' | 'custom') => void;
}

export function LearningGoals({ learningGoals, customGoals, onGoalsUpdate }: LearningGoalsProps) {
  const { toast } = useToast();
  const [newGoal, setNewGoal] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    setIsUpdating(true);
    
    try {
      const updatedGoals = [...customGoals, newGoal.trim()];
      const { error } = await supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) throw new Error("No user found");
        return supabase
          .from("profiles")
          .update({ custom_goals: updatedGoals })
          .eq("id", user.id);
      });

      if (error) throw error;
      
      onGoalsUpdate(updatedGoals, 'custom');
      setNewGoal("");
      toast({
        title: "Success",
        description: "Goal added successfully",
      });
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveGoal = async (index: number, type: 'learning' | 'custom') => {
    setIsUpdating(true);
    
    try {
      const goals = type === 'learning' ? learningGoals : customGoals;
      const updatedGoals = goals.filter((_, i) => i !== index);
      
      const { error } = await supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) throw new Error("No user found");
        return supabase
          .from("profiles")
          .update({ [`${type}_goals`]: updatedGoals })
          .eq("id", user.id);
      });

      if (error) throw error;
      
      onGoalsUpdate(updatedGoals, type);
      toast({
        title: "Success",
        description: "Goal removed successfully",
      });
    } catch (error) {
      console.error("Error removing goal:", error);
      toast({
        title: "Error",
        description: "Failed to remove goal",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Learning Goals</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Predefined Goals</h3>
          <div className="flex flex-wrap gap-2">
            {learningGoals.map((goal, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {goal}
                <button
                  onClick={() => handleRemoveGoal(index, 'learning')}
                  className="ml-2 hover:text-destructive"
                  disabled={isUpdating}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Custom Goals</h3>
          <div className="flex flex-wrap gap-2">
            {customGoals.map((goal, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {goal}
                <button
                  onClick={() => handleRemoveGoal(index, 'custom')}
                  className="ml-2 hover:text-destructive"
                  disabled={isUpdating}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a new goal..."
              className="max-w-xs"
            />
            <Button
              onClick={handleAddGoal}
              disabled={!newGoal.trim() || isUpdating}
            >
              Add Goal
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}