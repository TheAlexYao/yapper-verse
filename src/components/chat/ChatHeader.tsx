import { ArrowLeft, ArrowRight } from "lucide-react";
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
  onBack: () => void;
  isCompleted?: boolean;
  conversationId?: string;
  metrics?: {
    pronunciationScore: number;
    stylePoints: number;
    sentencesUsed: number;
  };
}

export function ChatHeader({ 
  scenario, 
  character, 
  onBack, 
  isCompleted,
  conversationId,
  metrics 
}: ChatHeaderProps) {
  const navigate = useNavigate();

  const handleViewFeedback = () => {
    navigate(`/feedback`, {
      state: {
        conversationId,
        metrics,
        completedAt: new Date().toLocaleString()
      }
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-10">
      <div className="bg-background/95 backdrop-blur-sm border-b px-2 py-2 bg-gradient-to-r from-accent/50 via-background to-accent/20">
        <div className="container max-w-2xl mx-auto flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex items-center justify-center gap-2">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium">{character.name}</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{scenario.title}</span>
          </div>
          {isCompleted && (
            <Button
              variant="ghost"
              onClick={handleViewFeedback}
              className="gap-2"
            >
              View Feedback
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}