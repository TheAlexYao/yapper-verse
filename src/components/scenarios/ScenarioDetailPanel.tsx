import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Scenario } from "@/pages/ScenarioHub";
import { useNavigate } from "react-router-dom";

interface ScenarioDetailPanelProps {
  scenario: Scenario;
  onClose: () => void;
  isMobile: boolean;
}

export function ScenarioDetailPanel({
  scenario,
  onClose,
  isMobile,
}: ScenarioDetailPanelProps) {
  const navigate = useNavigate();

  const handleStartScenario = () => {
    onClose();
    navigate("/character", { state: { scenario } });
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent
        className={`w-full ${!isMobile ? "max-w-xl" : ""} overflow-y-auto`}
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">{scenario.title}</h2>
            <p className="text-muted-foreground mt-2">{scenario.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Primary Goal</h3>
            <p>{scenario.primaryGoal}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Useful Phrases</h3>
            <ul className="list-disc list-inside space-y-1">
              {scenario.usefulPhrases.map((phrase, index) => (
                <li key={index}>{phrase}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Cultural Notes</h3>
            <p>{scenario.culturalNotes}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Location Details</h3>
            <p>{scenario.locationDetails}</p>
          </div>

          <Button className="w-full" onClick={handleStartScenario}>
            Start Scenario
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}