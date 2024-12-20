import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Scenario } from "@/pages/ScenarioHub";
import { CategoryFilters } from "./CategoryFilters";
import { ScenariosGrid } from "./ScenariosGrid";

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

        // Fetch all scenarios (they are now available for all languages)
        const { data: scenariosData, error } = await supabase
          .from('scenarios')
          .select(`*`);

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
      <CategoryFilters 
        selectedCategory={selectedCategory} 
        onCategorySelect={setSelectedCategory} 
      />
      <ScenariosGrid 
        scenarios={filteredScenarios}
        isLoading={isLoading}
        onScenarioSelect={onScenarioSelect}
      />
    </div>
  );
}