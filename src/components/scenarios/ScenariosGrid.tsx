import { ScenarioCard } from "./ScenarioCard";
import { Scenario } from "@/pages/ScenarioHub";

interface ScenariosGridProps {
  scenarios: Scenario[];
  isLoading: boolean;
  onScenarioSelect: (scenario: Scenario) => void;
}

export function ScenariosGrid({ scenarios, isLoading, onScenarioSelect }: ScenariosGridProps) {
  if (isLoading) {
    return (
      <div className="col-span-full text-center text-muted-foreground">
        Loading scenarios...
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="col-span-full text-center text-muted-foreground">
        No scenarios found for the selected criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
      {scenarios.map((scenario) => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
          onClick={() => onScenarioSelect(scenario)}
        />
      ))}
    </div>
  );
}