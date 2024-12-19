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
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/scenarios")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">
              {scenario.title}
            </h1>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <img
                src={character.avatar}
                alt={character.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span>{character.name}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-sm font-medium">Pronunciation</div>
            <div className="text-2xl font-bold text-primary">
              {metrics.pronunciationScore}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">Style Points</div>
            <div className="text-2xl font-bold text-primary">
              {metrics.stylePoints}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">Progress</div>
            <div className="text-2xl font-bold text-primary">
              {metrics.progress}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">Sentences</div>
            <div className="text-2xl font-bold text-primary">
              {metrics.sentencesUsed}/{metrics.sentenceLimit}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}