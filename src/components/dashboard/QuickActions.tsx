import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  currentLanguage: string;
}

export function QuickActions({ currentLanguage }: QuickActionsProps) {
  const navigate = useNavigate();
  const hasOngoingScenario = true; // This would come from user data

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-medium">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hasOngoingScenario && (
            <Button 
              onClick={() => navigate("/chat")}
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