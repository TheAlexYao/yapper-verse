import { useState, useEffect } from "react";
import { ScenarioCard } from "./ScenarioCard";
import { Scenario } from "@/pages/ScenarioHub";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface HistoryViewProps {
  searchQuery: string;
  onScenarioSelect: (scenario: Scenario) => void;
}

export function HistoryView({ searchQuery, onScenarioSelect }: HistoryViewProps) {
  const [pastScenarios, setPastScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPastScenarios = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user's completed scenarios
        const { data: userScenarios, error } = await supabase
          .from('user_scenarios')
          .select(`
            *,
            scenarios (
              *,
              languages!inner (
                code,
                name
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false });

        if (error) throw error;

        const formattedScenarios: Scenario[] = userScenarios.map((userScenario) => ({
          id: userScenario.scenarios.id,
          title: userScenario.scenarios.title,
          description: `Completed on ${new Date(userScenario.completed_at!).toLocaleDateString()}`,
          category: userScenario.scenarios.category,
          primaryGoal: userScenario.scenarios.primary_goal || "",
          usefulPhrases: userScenario.scenarios.useful_phrases || [],
          culturalNotes: userScenario.scenarios.cultural_notes || "",
          locationDetails: userScenario.scenarios.location_details || "",
        }));

        setPastScenarios(formattedScenarios);
      } catch (error) {
        console.error('Error fetching past scenarios:', error);
        toast({
          title: "Error",
          description: "Failed to load past scenarios",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPastScenarios();
  }, [toast]);

  const filterScenarios = (scenarios: Scenario[]) => {
    return scenarios.filter(
      (scenario) =>
        scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scenario.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center text-muted-foreground">
            Loading past scenarios...
          </div>
        ) : filterScenarios(pastScenarios).length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">
            No past scenarios found.
          </div>
        ) : (
          filterScenarios(pastScenarios).map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onClick={() => onScenarioSelect(scenario)}
            />
          ))
        )}
      </div>
    </div>
  );
}