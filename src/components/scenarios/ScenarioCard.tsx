import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark } from "lucide-react";
import { Scenario } from "@/pages/ScenarioHub";

const categoryEmojis: { [key: string]: string } = {
  Travel: "✈️",
  Dining: "🍽️",
  Business: "💼",
  Shopping: "🛍️",
  Social: "👥",
};

interface ScenarioCardProps {
  scenario: Scenario;
  onClick: () => void;
}

export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  const emoji = categoryEmojis[scenario.category] || "💼";

  return (
    <Card
      className="cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.02] relative overflow-hidden group h-full"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label={scenario.category}>{emoji}</span>
            <CardTitle className="text-xl font-semibold transition-colors group-hover:text-primary">{scenario.title}</CardTitle>
          </div>
          {scenario.isBookmarked && (
            <Bookmark className="h-6 w-6 text-primary transition-colors" fill="currentColor" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base text-muted-foreground line-clamp-2">{scenario.description}</p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] transform translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
      </CardContent>
    </Card>
  );
}