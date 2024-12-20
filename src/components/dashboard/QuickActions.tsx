import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface QuickActionsProps {
  currentLanguage: string;
}

export function QuickActions({ currentLanguage }: QuickActionsProps) {
  const navigate = useNavigate();
  const [lastScenario, setLastScenario] = useState<any>(null);

  useEffect(() => {
    const fetchLastScenario = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch the most recent in-progress scenario for the current language
        const { data: scenarioData } = await supabase
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

        setLastScenario(scenarioData);
      } catch (error) {
        console.error('Error fetching last scenario:', error);
      }
    };

    if (currentLanguage) {
      fetchLastScenario();
    }
  }, [currentLanguage]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-medium">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lastScenario && (
            <Button 
              onClick={() => navigate("/chat", { state: { scenario: lastScenario.scenarios } })}
              className="gap-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
            >
              <Play className="h-4 w-4" />
              Resume Last Scenario
            </Button>
          )}
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