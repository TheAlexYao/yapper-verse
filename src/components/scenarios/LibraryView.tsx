import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScenarioCard } from "./ScenarioCard";
import { Scenario } from "@/pages/ScenarioHub";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = [
  { id: "All", emoji: "✨" },
  { id: "Food", emoji: "🍜" },
  { id: "Dating", emoji: "💏" },
  { id: "Learning", emoji: "🧠" },
  { id: "Work", emoji: "💼" },
  { id: "Friends", emoji: "👥" },
  { id: "Travel", emoji: "✈️" },
  { id: "Shopping", emoji: "🛍️" },
  { id: "Play", emoji: "🎮" }
];

interface LibraryViewProps {
  searchQuery: string;
  onScenarioSelect: (scenario: Scenario) => void;
}

export function LibraryView({ searchQuery, onScenarioSelect }: LibraryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        // Get current user's target language
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from('profiles')
          .select('target_language')
          .eq('id', user.id)
          .maybeSingle();

        if (!profileData?.target_language) {
          toast({
            title: "No target language selected",
            description: "Please select a target language in your profile",
            variant: "destructive",
          });
          return;
        }

        // Fetch scenarios for the user's target language
        const { data: scenariosData, error } = await supabase
          .from('scenarios')
          .select(`
            *,
            languages!inner (
              code,
              name
            )
          `)
          .eq('languages.code', profileData.target_language);

        if (error) {
          console.error('Error fetching scenarios:', error);
          throw error;
        }

        const formattedScenarios: Scenario[] = scenariosData.map((scenario) => ({
          id: scenario.id,
          title: scenario.title,
          description: scenario.description || "",
          category: scenario.category,
          primaryGoal: scenario.primary_goal || "",
          usefulPhrases: scenario.useful_phrases || [],
          culturalNotes: scenario.cultural_notes || "",
          locationDetails: scenario.location_details || "",
        }));

        setScenarios(formattedScenarios);
      } catch (error) {
        console.error('Error fetching scenarios:', error);
        toast({
          title: "Error",
          description: "Failed to load scenarios",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchScenarios();
  }, [toast]);

  const filteredScenarios = scenarios.filter((scenario) => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || scenario.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {CATEGORIES.map(({ id, emoji }) => (
          <Button
            key={id}
            variant={selectedCategory === id ? "default" : "outline"}
            onClick={() => setSelectedCategory(id)}
            className={`transition-all duration-300 ease-out ${
              selectedCategory === id
                ? "bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 shadow-lg scale-105"
                : "hover:bg-accent hover:text-accent-foreground hover:scale-105"
            } gap-2 text-base px-6`}
          >
            <span role="img" aria-label={id} className="text-lg">{emoji}</span>
            {id}
          </Button>
        ))}
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
        {isLoading ? (
          <div className="col-span-full text-center text-muted-foreground">
            Loading scenarios...
          </div>
        ) : filteredScenarios.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">
            No scenarios found for the selected criteria.
          </div>
        ) : (
          filteredScenarios.map((scenario) => (
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