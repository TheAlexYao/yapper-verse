import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScenarioCard } from "./ScenarioCard";
import { Scenario } from "@/pages/ScenarioHub";

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

const MOCK_SCENARIOS: Scenario[] = [
  {
    id: "1",
    title: "Ordering at a Café",
    description: "Learn how to order your favorite drinks and snacks at a local café.",
    category: "Food",
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
  {
    id: "3",
    title: "Business Meeting",
    description: "Navigate a professional business meeting with confidence.",
    category: "Work",
    primaryGoal: "Successfully participate in a business meeting",
    usefulPhrases: ["Let's discuss...", "I agree with...", "Could you clarify..."],
    culturalNotes: "Business meetings often start with small talk",
    locationDetails: "Corporate office building",
    isBookmarked: true,
  },
  {
    id: "4",
    title: "Shopping for Clothes",
    description: "Learn how to shop for clothes and ask about sizes and prices.",
    category: "Shopping",
    primaryGoal: "Successfully purchase clothing items",
    usefulPhrases: ["Do you have this in...", "Can I try this on?", "Is this on sale?"],
    culturalNotes: "Some stores may have different size systems",
    locationDetails: "Local shopping mall",
    isBookmarked: false,
  },
  {
    id: "5",
    title: "Making Friends",
    description: "Practice social interactions and making new friends in casual settings.",
    category: "Friends",
    primaryGoal: "Successfully initiate and maintain casual conversations",
    usefulPhrases: ["Nice to meet you", "What do you do?", "Would you like to..."],
    culturalNotes: "Personal space and greeting customs vary by culture",
    locationDetails: "Social gathering or event",
    isBookmarked: false,
  }
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
