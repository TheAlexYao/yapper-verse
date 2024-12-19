import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

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
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center mr-2">
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-6 h-6 rounded-full"
                />
              </div>
              <span>{character.name}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">Pronunciation</div>
            <div className="text-2xl font-bold text-indigo-500">
              {metrics.pronunciationScore}%
            </div>
            <Progress value={metrics.pronunciationScore} className="h-1 mt-2" />
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">Style Points</div>
            <div className="text-2xl font-bold text-purple-500">
              {metrics.stylePoints}
            </div>
            <Progress value={(metrics.stylePoints / 200) * 100} className="h-1 mt-2" />
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">Progress</div>
            <div className="text-2xl font-bold text-blue-500">
              {metrics.progress}%
            </div>
            <Progress value={metrics.progress} className="h-1 mt-2" />
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">Sentences</div>
            <div className="text-2xl font-bold text-orange-500">
              {metrics.sentencesUsed}/{metrics.sentenceLimit}
            </div>
            <Progress 
              value={(metrics.sentencesUsed / metrics.sentenceLimit) * 100} 
              className="h-1 mt-2" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}