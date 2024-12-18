import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bookmark, X } from "lucide-react";
import { Scenario } from "@/pages/ScenarioHub";

interface ScenarioDetailPanelProps {
  scenario: Scenario;
  onClose: () => void;
  isMobile: boolean;
}

export function ScenarioDetailPanel({ scenario, onClose, isMobile }: ScenarioDetailPanelProps) {
  const content = (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{scenario.title}</h2>
          <p className="text-muted-foreground">{scenario.description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <section>
          <h3 className="font-semibold mb-2">Primary Goal</h3>
          <p className="text-muted-foreground">{scenario.primaryGoal}</p>
        </section>

        <section>
          <h3 className="font-semibold mb-2">Useful Phrases</h3>
          <ul className="list-disc list-inside space-y-1">
            {scenario.usefulPhrases.map((phrase, index) => (
              <li key={index} className="text-muted-foreground">{phrase}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-2">Cultural Notes</h3>
          <p className="text-muted-foreground">{scenario.culturalNotes}</p>
        </section>

        <section>
          <h3 className="font-semibold mb-2">Location Details</h3>
          <p className="text-muted-foreground">{scenario.locationDetails}</p>
        </section>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" className="gap-2">
          <Bookmark className="h-4 w-4" />
          {scenario.isBookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
        <Button className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90">
          Start Scenario
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={true} onOpenChange={() => onClose()}>
        <SheetContent side="bottom" className="h-[80vh]">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        {content}
      </DialogContent>
    </Dialog>
  );
}