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
  onBack: () => void;
}

export function ChatHeader({ scenario, character, onBack }: ChatHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-10">
      {/* Header bar with gradient */}
      <div className="bg-background/95 backdrop-blur-sm border-b px-2 py-2 bg-gradient-to-r from-accent/50 via-background to-accent/20">
        <div className="container max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="-ml-2"
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
      
      {/* Scenario title with gradient */}
      <div className="bg-accent/50 backdrop-blur-sm px-4 py-2.5 bg-gradient-to-r from-primary/10 via-accent/20 to-accent/30">
        <div className="container max-w-2xl mx-auto">
          <h2 className="text-sm font-medium text-center">{scenario.title}</h2>
        </div>
      </div>
    </div>
  );
}