import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Scenario } from "@/pages/ScenarioHub";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface ScenarioDialogProps {
  scenario: Scenario | null;
  onClose: () => void;
}

export function ScenarioDialog({ scenario, onClose }: ScenarioDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStartScenario = async () => {
    if (!scenario) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_scenarios')
        .upsert({
          user_id: user.id,
          scenario_id: scenario.id,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        });

      if (error) throw error;

      onClose();
      navigate("/character", { state: { scenario } });
    } catch (error) {
      console.error('Error starting scenario:', error);
      toast({
        title: "Error",
        description: "Failed to start scenario",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={!!scenario} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-none shadow-xl">
        {scenario && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
                {scenario.title}
              </h2>
              <p className="text-muted-foreground mt-2">{scenario.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Primary Goal</h3>
                <p className="mt-1">{scenario.primaryGoal}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Useful Phrases</h3>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {scenario.usefulPhrases.map((phrase, index) => (
                    <li key={index} className="text-muted-foreground">{phrase}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Cultural Notes</h3>
                <p className="mt-1 text-muted-foreground">{scenario.culturalNotes}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Location Details</h3>
                <p className="mt-1 text-muted-foreground">{scenario.locationDetails}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                className="w-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 text-white font-semibold"
                onClick={handleStartScenario}
              >
                Start Scenario
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}