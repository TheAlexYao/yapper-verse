import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScenarioCard } from "./ScenarioCard";
import { Scenario } from "@/pages/ScenarioHub";
import { 
  Building2, 
  Plane, 
  UtensilsCrossed, 
  ShoppingBag, 
  Users,
  Clock,
  Sparkles,
  Trophy
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CATEGORIES = [
  { id: "All", icon: Sparkles },
  { id: "Travel", icon: Plane },
  { id: "Dining", icon: UtensilsCrossed },
  { id: "Business", icon: Building2 },
  { id: "Shopping", icon: ShoppingBag },
  { id: "Social", icon: Users }
];

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
  {
    id: "2",
    title: "Hotel Check-in",
    description: "Practice checking into a hotel and requesting amenities.",
    category: "Travel",
    primaryGoal: "Successfully check into a hotel",
    usefulPhrases: ["I have a reservation", "What time is checkout?"],
    culturalNotes: "Some hotels require passport at check-in",
    locationDetails: "City center hotel",
    isBookmarked: false,
  },
  // Add more scenarios as needed
];

const QUICK_START_TEMPLATES = [
  {
    id: "template1",
    title: "Market Negotiation",
    description: "Learn to haggle prices at local markets",
    category: "Shopping",
    primaryGoal: "Successfully negotiate a better price",
    usefulPhrases: ["Can you lower the price?", "That's too expensive"],
    culturalNotes: "Negotiating is expected in many local markets",
    locationDetails: "Local market",
    isBookmarked: false,
  },
  // Add more templates
];

interface LibraryViewProps {
  searchQuery: string;
  onScenarioSelect: (scenario: Scenario) => void;
}

export function LibraryView({ searchQuery, onScenarioSelect }: LibraryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const completedCount = 3; // Replace with actual completed count
  const totalScenarios = MOCK_SCENARIOS.length;

  const filteredScenarios = MOCK_SCENARIOS.filter((scenario) => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || scenario.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Completed Scenarios Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Trophy className="h-4 w-4" />
        <span>{completedCount} scenarios completed</span>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ id, icon: Icon }) => (
          <Button
            key={id}
            variant={selectedCategory === id ? "default" : "outline"}
            onClick={() => setSelectedCategory(id)}
            className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 gap-2"
          >
            <Icon className="h-4 w-4" />
            {id}
          </Button>
        ))}
      </div>

      {/* Quick Start Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_START_TEMPLATES.map((template) => (
            <ScenarioCard
              key={template.id}
              scenario={template}
              onClick={() => onScenarioSelect(template)}
            />
          ))}
        </div>
      </div>

      {/* Recently Generated */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recently Generated
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScenarios.slice(0, 3).map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onClick={() => onScenarioSelect(scenario)}
            />
          ))}
        </div>
      </div>

      {/* All Scenarios */}
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
