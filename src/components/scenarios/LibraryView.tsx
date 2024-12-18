import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScenarioCard } from "./ScenarioCard";
import { Scenario } from "@/pages/ScenarioHub";

const CATEGORIES = ["All", "Travel", "Dining", "Business", "Shopping", "Social"];

// Mock data - replace with real data later
const MOCK_SCENARIOS: Scenario[] = [
  {
    id: "1",
    title: "Ordering at a Café",
    description: "Learn how to order your favorite drinks and snacks at a local café.",
    category: "Dining",
    primaryGoal: "Successfully order a drink and food item",
    usefulPhrases: ["Can I have...", "How much is...", "Thank you"],
    culturalNotes: "In many cultures, it's common to greet the staff when entering and leaving.",
    locationDetails: "Local café in the city center",
    isBookmarked: false,
  },
  // Add more mock scenarios as needed
];

interface LibraryViewProps {
  searchQuery: string;
  onScenarioSelect: (scenario: Scenario) => void;
}

export function LibraryView({ searchQuery, onScenarioSelect }: LibraryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredScenarios = MOCK_SCENARIOS.filter((scenario) => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || scenario.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onClick={() => onScenarioSelect(scenario)}
          />
        ))}
      </div>
    </div>
  );
}