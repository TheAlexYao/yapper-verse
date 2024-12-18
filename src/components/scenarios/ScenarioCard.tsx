import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, Building2, Plane, UtensilsCrossed, ShoppingBag, Users } from "lucide-react";
import { Scenario } from "@/pages/ScenarioHub";

const categoryIcons: { [key: string]: any } = {
  Travel: Plane,
  Dining: UtensilsCrossed,
  Business: Building2,
  Shopping: ShoppingBag,
  Social: Users,
};

interface ScenarioCardProps {
  scenario: Scenario;
  onClick: () => void;
}

export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  const CategoryIcon = categoryIcons[scenario.category] || Building2;

  return (
    <Card
      className="cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.02] relative overflow-hidden group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CategoryIcon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            <CardTitle className="text-lg font-semibold transition-colors group-hover:text-primary">{scenario.title}</CardTitle>
          </div>
          {scenario.isBookmarked && (
            <Bookmark className="h-5 w-5 text-primary transition-colors" fill="currentColor" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{scenario.description}</p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] transform translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
      </CardContent>
    </Card>
  );
}