import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LibraryView } from "@/components/scenarios/LibraryView";
import { CreateScenarioView } from "@/components/scenarios/CreateScenarioView";
import { HistoryView } from "@/components/scenarios/HistoryView";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { languages } from "@/components/onboarding/steps/language/languages";

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
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [completedCount, setCompletedCount] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserLanguageAndStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user's target language
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('target_language')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        
        if (profileData?.target_language) {
          setTargetLanguage(profileData.target_language);
          
          // Fetch completed scenarios count for this language
          const { data: scenariosData, error: scenariosError } = await supabase
            .from('user_scenarios')
            .select(`
              id,
              scenarios!inner (
                languages!inner (
                  code
                )
              )
            `)
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .eq('scenarios.languages.code', profileData.target_language);

          if (scenariosError) throw scenariosError;
          setCompletedCount(scenariosData?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user language preferences",
          variant: "destructive",
        });
      }
    };

    fetchUserLanguageAndStats();
  }, [toast]);

  const handleStartScenario = async () => {
    if (!selectedScenario) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create or update user_scenario record
      const { error } = await supabase
        .from('user_scenarios')
        .upsert({
          user_id: user.id,
          scenario_id: selectedScenario.id,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSelectedScenario(null);
      navigate("/character", { state: { scenario: selectedScenario } });
    } catch (error) {
      console.error('Error starting scenario:', error);
      toast({
        title: "Error",
        description: "Failed to start scenario",
        variant: "destructive",
      });
    }
  };

  const languageName = languages.find(l => l.value === targetLanguage)?.label || targetLanguage;

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

          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
              Your Language Adventures
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You're ready to practice {languageName} through real conversations. 
              You've completed {completedCount} scenarios so far. Choose a new scenario, 
              meet the characters, and dive into interactive dialogue. Think of it like leveling up 
              your language skills as you play.
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

        <Dialog open={!!selectedScenario} onOpenChange={() => setSelectedScenario(null)}>
          <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-none shadow-xl">
            {selectedScenario && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
                    {selectedScenario.title}
                  </h2>
                  <p className="text-muted-foreground mt-2">{selectedScenario.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Primary Goal</h3>
                    <p className="mt-1">{selectedScenario.primaryGoal}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Useful Phrases</h3>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {selectedScenario.usefulPhrases.map((phrase, index) => (
                        <li key={index} className="text-muted-foreground">{phrase}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Cultural Notes</h3>
                    <p className="mt-1 text-muted-foreground">{selectedScenario.culturalNotes}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Location Details</h3>
                    <p className="mt-1 text-muted-foreground">{selectedScenario.locationDetails}</p>
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
      </div>
    </div>
  );
};

export default ScenarioHub;