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
    isBookmarked: true,
  },
  // Add more mock scenarios as needed
];

const MOCK_BOOKMARKED_SCENARIOS: Scenario[] = [
  {
    id: "bookmark1",
    title: "Hotel Check-in",
    description: "Saved for later practice",
    category: "Travel",
    primaryGoal: "Check into a hotel and request amenities",
    usefulPhrases: ["I have a reservation", "What time is checkout?"],
    culturalNotes: "Some hotels require passport at check-in",
    locationDetails: "City center hotel",
    isBookmarked: true,
  },
  // Add more mock scenarios as needed
];

interface PastBookmarkedViewProps {
  searchQuery: string;
  onScenarioSelect: (scenario: Scenario) => void;
}

export function PastBookmarkedView({ searchQuery, onScenarioSelect }: PastBookmarkedViewProps) {
  const filterScenarios = (scenarios: Scenario[]) => {
    return scenarios.filter(
      (scenario) =>
        scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scenario.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="past">
        <TabsList>
          <TabsTrigger value="past">Past Scenarios</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
        </TabsList>
        <TabsContent value="past">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterScenarios(MOCK_PAST_SCENARIOS).map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onClick={() => onScenarioSelect(scenario)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="bookmarked">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterScenarios(MOCK_BOOKMARKED_SCENARIOS).map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onClick={() => onScenarioSelect(scenario)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}