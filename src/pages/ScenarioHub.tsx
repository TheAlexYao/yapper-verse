import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LibraryView } from "@/components/scenarios/LibraryView";
import { CreateScenarioView } from "@/components/scenarios/CreateScenarioView";
import { HistoryView } from "@/components/scenarios/HistoryView";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ScenarioStats } from "@/components/scenario-hub/ScenarioStats";
import { ScenarioDialog } from "@/components/scenario-hub/ScenarioDialog";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  primaryGoal: string;
  usefulPhrases: string[];
  culturalNotes: string;
  locationDetails: string;
}

const ScenarioHub = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic background gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#38b6ff]/10 animate-gradient-shift" />
      <div className="fixed inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              className="hover:bg-background/60"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <ScenarioStats />

          <div className="bg-background/50 backdrop-blur-sm border rounded-lg shadow-lg">
            <div className="p-6 border-b">
              <CreateScenarioView onScenarioCreated={setSelectedScenario} />
            </div>

            <Tabs defaultValue="library" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto">
                <TabsTrigger
                  value="library"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  Scenario Library
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  History
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="library" className="m-0">
                  <div className="text-center mb-6">
                    <p className="text-muted-foreground">
                      Explore our collection of pre-built scenes. Filter by theme—like ordering food, 
                      asking for directions, or meeting new friends. Each scenario feels like a mini story: 
                      pick one, step in, and see where the conversation takes you.
                    </p>
                  </div>
                  <LibraryView
                    searchQuery=""
                    onScenarioSelect={setSelectedScenario}
                  />
                </TabsContent>
                <TabsContent value="history" className="m-0">
                  <div className="text-center mb-6">
                    <p className="text-muted-foreground">
                      Revisit your previous scenarios and practice sessions. See your progress and 
                      refine your skills by replaying conversations you've had before.
                    </p>
                  </div>
                  <HistoryView
                    searchQuery=""
                    onScenarioSelect={setSelectedScenario}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        <ScenarioDialog 
          scenario={selectedScenario} 
          onClose={() => setSelectedScenario(null)} 
        />
      </div>
    </div>
  );
};

export default ScenarioHub;