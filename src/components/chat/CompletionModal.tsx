import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: {
    pronunciationScore: number;
    stylePoints: number;
    sentencesUsed: number;
  };
  conversationId: string;
}

export function CompletionModal({ 
  isOpen, 
  onClose,
  metrics,
  conversationId
}: CompletionModalProps) {
  const navigate = useNavigate();

  const handleViewFeedback = () => {
    navigate("/feedback", { 
      state: { 
        conversationId,
        metrics
      } 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            Conversation Complete!
          </DialogTitle>
          <DialogDescription>
            You've reached the end of this conversation practice.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-accent/20">
                <div className="text-2xl font-bold text-accent-foreground">
                  {metrics.pronunciationScore}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Pronunciation Score
                </div>
              </div>
              <div className="p-4 rounded-lg bg-accent/20">
                <div className="text-2xl font-bold text-accent-foreground">
                  {metrics.stylePoints}
                </div>
                <div className="text-sm text-muted-foreground">
                  Style Points
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleViewFeedback}
          className="w-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white hover:opacity-90"
        >
          View Detailed Feedback
        </Button>
      </DialogContent>
    </Dialog>
  );
}