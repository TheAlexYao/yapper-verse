import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Scenario } from "./ScenarioHub";
import { Character } from "@/types/character";
import { CharacterCard } from "@/components/characters/CharacterCard";
import { ScenarioDetails } from "@/components/characters/ScenarioDetails";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function Character() {
  const [isLoading, setIsLoading] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const scenario = location.state?.scenario as Scenario;

  useEffect(() => {
    if (!scenario) {
      navigate("/scenarios");
      return;
    }

    const fetchCharacters = async () => {
      try {
        const { data: charactersData, error } = await supabase
          .from('characters')
          .select('*')
          .eq('scenario_id', scenario.id);

        if (error) throw error;

        if (charactersData) {
          setCharacters(charactersData);
        }
      } catch (error) {
        console.error('Error fetching characters:', error);
        toast({
          title: "Error",
          description: "Failed to load characters",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, [scenario, navigate, toast]);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleStartConversation = () => {
    navigate("/chat", {
      state: {
        scenario,
        character: selectedCharacter,
      },
    });
  };

  if (!scenario) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#38b6ff]/10 animate-gradient-shift" />
      <div className="fixed inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/scenarios")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scenarios
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
              Let's have a conversation!
            </h1>
          </div>

          <ScenarioDetails scenario={scenario} />

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-semibold mb-2">
                Preparing Your Conversation Partners...
              </h2>
              <p className="text-muted-foreground">
                We're creating a few interesting personalities who can help you navigate this scenario. Hang tight!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  Who do you want to talk to?
                </h2>
                <p className="text-muted-foreground">
                  Pick one of these characters to guide you through this scenario. Each brings a unique way of speaking and cultural background to help you learn.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {characters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    isSelected={selectedCharacter?.id === character.id}
                    onSelect={handleCharacterSelect}
                    onStartConversation={handleStartConversation}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}