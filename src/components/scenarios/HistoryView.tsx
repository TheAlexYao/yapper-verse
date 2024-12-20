import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScenarioCard } from "./ScenarioCard";
import { Scenario } from "@/pages/ScenarioHub";

// Mock data - replace with real data later
const MOCK_PAST_SCENARIOS: Scenario[] = [
  {
    id: "past1",
    title: "Restaurant Order",
    description: "Completed on March 15, 2024",
    category: "Dining",
    primaryGoal: "Order a full meal",
    usefulPhrases: ["I would like...", "Could you recommend..."],
    culturalNotes: "Tipping customs vary by country",
    locationDetails: "Fine dining restaurant",
  },
  // Add more mock scenarios as needed
];

interface HistoryViewProps {
  searchQuery: string;
  onScenarioSelect: (scenario: Scenario) => void;
}

export function HistoryView({ searchQuery, onScenarioSelect }: HistoryViewProps) {
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
        {filterScenarios(MOCK_PAST_SCENARIOS).map((scenario) => (
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