import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  scenario: {
    title: string;
  };
  character: {
    name: string;
    avatar: string;
  };
  metrics: {
    pronunciationScore: number;
    stylePoints: number;
    progress: number;
    sentencesUsed: number;
    sentenceLimit: number;
  };
  onBack: () => void;
}

export function ChatHeader({ scenario, character, onBack }: ChatHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-10">
      {/* Compact header */}
      <div className="bg-background/95 backdrop-blur-sm border-b px-4 py-2">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm font-medium">{character.name}</span>
          </div>
        </div>
      </div>
      
      {/* Scenario info */}
      <div className="bg-accent/50 backdrop-blur-sm px-4 py-2">
        <div className="max-w-lg mx-auto">
          <h2 className="text-sm font-medium text-center">{scenario.title}</h2>
        </div>
      </div>
    </div>
  );
}