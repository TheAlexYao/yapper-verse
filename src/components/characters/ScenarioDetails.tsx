import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scenario } from "@/pages/ScenarioHub";

interface ScenarioDetailsProps {
  scenario: Scenario;
}

export function ScenarioDetails({ scenario }: ScenarioDetailsProps) {
  return (
    <Card className="mb-8 bg-white/50 backdrop-blur-sm border-muted">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{scenario.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-lg text-muted-foreground mb-4">{scenario.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Primary Goal</h3>
            <p className="text-muted-foreground">{scenario.primaryGoal}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Cultural Notes</h3>
            <p className="text-muted-foreground">{scenario.culturalNotes}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}