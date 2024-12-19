import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Scenario } from "./ScenarioHub";

interface Character {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatar: string;
  bio: string;
  languageStyle: string[];
  conversationCount?: number;
}

const MOCK_CHARACTERS: Character[] = [
  {
    id: "1",
    name: "Marie",
    age: 28,
    gender: "Female",
    avatar: "/placeholder.svg",
    bio: "A friendly barista who's worked in Parisian cafés for 5 years. She's patient and enjoys helping tourists navigate French coffee culture.",
    languageStyle: ["Casual but professional", "Uses common café vocabulary", "Speaks at a moderate pace"],
    conversationCount: 0,
  },
  {
    id: "2",
    name: "Jean-Pierre",
    age: 45,
    gender: "Male",
    avatar: "/placeholder.svg",
    bio: "A seasoned café owner who takes pride in traditional French service. He's formal but warm, and loves sharing cultural insights.",
    languageStyle: ["Formal and polite", "Rich vocabulary", "Traditional expressions"],
    conversationCount: 0,
  },
  {
    id: "3",
    name: "Sophie",
    age: 23,
    gender: "Female",
    avatar: "/placeholder.svg",
    bio: "A university student who works part-time at the café. She's casual, uses modern slang, and relates well to younger customers.",
    languageStyle: ["Very casual", "Modern slang", "Fast-paced speech"],
    conversationCount: 0,
  },
];

export default function Character() {
  const [isGenerating, setIsGenerating] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const scenario = location.state?.scenario as Scenario;

  useEffect(() => {
    if (!scenario) {
      navigate("/scenarios");
      return;
    }

    // Simulate character generation
    const timer = setTimeout(() => {
      setCharacters(MOCK_CHARACTERS);
      setIsGenerating(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [scenario, navigate]);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    // TODO: Navigate to conversation page
    console.log("Selected character:", character);
  };

  if (!scenario) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#38b6ff]/10 animate-gradient-shift" />
      <div className="fixed inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/scenarios")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scenarios
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
              Meet Your Conversation Partner
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              {scenario.title}
            </p>
            <div className="mt-2 text-sm text-muted-foreground">
              Step 2 of 3
            </div>
          </div>

          {/* Content */}
          {isGenerating ? (
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
                  Choose Your Conversation Partner
                </h2>
                <p className="text-muted-foreground">
                  Pick one of these three characters to guide you through this scenario. Each brings a unique way of speaking and cultural background to help you learn.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className={cn(
                      "relative p-6 rounded-lg border bg-card transition-all duration-300",
                      selectedCharacter?.id === character.id
                        ? "ring-2 ring-primary"
                        : "hover:shadow-lg"
                    )}
                  >
                    <div className="aspect-square rounded-full overflow-hidden mb-4 bg-muted">
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-1">
                      {character.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Age: {character.age}, {character.gender}
                    </p>
                    <p className="text-sm mb-4">{character.bio}</p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-semibold">Language Style:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {character.languageStyle.map((style, index) => (
                          <li key={index}>{style}</li>
                        ))}
                      </ul>
                    </div>
                    {character.conversationCount !== undefined && (
                      <p className="text-sm text-muted-foreground mb-4">
                        Previous conversations: {character.conversationCount}
                      </p>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => handleCharacterSelect(character)}
                    >
                      Choose {character.name}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}