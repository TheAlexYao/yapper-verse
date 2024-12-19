import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scenario } from "@/pages/ScenarioHub";

const categoryEmojis: { [key: string]: string } = {
  Travel: "✈️",
  Dining: "🍽️",
  Business: "💼",
  Shopping: "🛍️",
  Social: "👥",
  Food: "🍜",
  Dating: "💏",
  Learning: "🧠",
  Work: "💼",
  Friends: "👥",
  Play: "🎮",
};

interface ScenarioCardProps {
  scenario: Scenario;
  onClick: () => void;
}

export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  const emoji = categoryEmojis[scenario.category] || "💼";

  return (
    <Card
      className="cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.02] relative overflow-hidden group h-full bg-white/50 backdrop-blur-sm border-muted"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label={scenario.category}>{emoji}</span>
          <CardTitle className="text-xl font-semibold transition-colors group-hover:text-primary">{scenario.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base text-muted-foreground line-clamp-2">{scenario.description}</p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] transform translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
      </CardContent>
    </Card>
  );
}