import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  currentLanguage: string;
}

export function QuickActions({ currentLanguage }: QuickActionsProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleResumeLastScenario = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch the most recent in-progress scenario for the current language
      const { data: scenarioData, error } = await supabase
        .from('user_scenarios')
        .select(`
          *,
          scenarios (
            *,
            languages (
              code
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .eq('scenarios.languages.code', currentLanguage)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No scenario found
          toast({
            title: "No scenario in progress",
            description: "Start a new scenario to begin practicing!",
          });
          return;
        }
        throw error;
      }

      navigate("/chat", { state: { scenario: scenarioData.scenarios } });
    } catch (error) {
      console.error('Error fetching last scenario:', error);
      toast({
        title: "Error",
        description: "Failed to load last scenario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-medium">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            onClick={handleResumeLastScenario}
            className="gap-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
            disabled={isLoading}
          >
            <Play className="h-4 w-4" />
            Resume Last Scenario
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/scenarios")}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Explore Scenarios
          </Button>
        </div>
      </div>
    </Card>
  );
}