import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
}

export function ChatHeader({ scenario, character, metrics }: ChatHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-10">
      {/* Compact HUD-style score bar */}
      <div className="bg-background/95 backdrop-blur-sm border-b px-4 py-2">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/scenarios")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <span className="mr-2">🎯</span>
              <span className="font-medium">{metrics.pronunciationScore}%</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⭐️</span>
              <span className="font-medium">{metrics.stylePoints}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📝</span>
              <span className="font-medium">{metrics.sentencesUsed}/{metrics.sentenceLimit}</span>
            </div>
          </div>

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
      
      {/* Collapsible scenario info */}
      <div className="bg-accent/50 backdrop-blur-sm px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-sm font-medium text-center">{scenario.title}</h2>
        </div>
      </div>
    </div>
  );
}