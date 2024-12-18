import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark } from "lucide-react";
import { Scenario } from "@/pages/ScenarioHub";

interface ScenarioCardProps {
  scenario: Scenario;
  onClick: () => void;
}

export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{scenario.title}</CardTitle>
          {scenario.isBookmarked && (
            <Bookmark className="h-5 w-5 text-primary" fill="currentColor" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{scenario.description}</p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] transform translate-y-full transition-transform group-hover:translate-y-0" />
      </CardContent>
    </Card>
  );
}