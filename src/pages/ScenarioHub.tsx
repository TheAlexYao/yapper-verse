import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LibraryView } from "@/components/scenarios/LibraryView";
import { CreateScenarioView } from "@/components/scenarios/CreateScenarioView";
import { PastBookmarkedView } from "@/components/scenarios/PastBookmarkedView";
import { ScenarioDetailPanel } from "@/components/scenarios/ScenarioDetailPanel";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  primaryGoal: string;
  usefulPhrases: string[];
  culturalNotes: string;
  locationDetails: string;
  isBookmarked: boolean;
}

const ScenarioHub = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const isMobile = useIsMobile();

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
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
              Your Language Scenes
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You're set to practice [Target Language]. Explore ready-made scenarios, create your own, or revisit past sessions. 
              Whether it's asking for directions in a busy market or chatting at a local café, we've got the scenes to help you blend right in.
            </p>
          </div>

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
                  Library
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  Past & Bookmarked
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="library" className="m-0">
                  <div className="text-center mb-6">
                    <p className="text-muted-foreground">
                      Browse our curated scenarios. Filter by category and pick what interests you—ordering lunch, 
                      finding a hotel, making small talk. Each scenario comes with key phrases and cultural tips 
                      to keep your practice natural.
                    </p>
                  </div>
                  <LibraryView
                    searchQuery=""
                    onScenarioSelect={setSelectedScenario}
                  />
                </TabsContent>
                <TabsContent value="past" className="m-0">
                  <div className="text-center mb-6">
                    <p className="text-muted-foreground">
                      Want to revisit something you tried before? Check out your past scenarios or jump into 
                      bookmarked favorites. Pick up where you left off, or refine what you already know.
                    </p>
                  </div>
                  <PastBookmarkedView
                    searchQuery=""
                    onScenarioSelect={setSelectedScenario}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {selectedScenario && (
          <ScenarioDetailPanel
            scenario={selectedScenario}
            onClose={() => setSelectedScenario(null)}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

export default ScenarioHub;