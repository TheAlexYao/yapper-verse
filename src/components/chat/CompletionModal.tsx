import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export function CompletionModal({ isOpen, onClose, metrics, conversationId }: CompletionModalProps) {
  const navigate = useNavigate();

  const handleContinue = () => {
    onClose();
    navigate(`/feedback`, {
      state: {
        conversationId,
        metrics,
        completedAt: new Date().toLocaleString()
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Conversation Complete!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
              <span>Pronunciation Score</span>
              <span className="font-bold">{metrics.pronunciationScore}%</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
              <span>Style Points</span>
              <span className="font-bold">{metrics.stylePoints}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
              <span>Sentences Used</span>
              <span className="font-bold">{metrics.sentencesUsed}</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleContinue}>
              View Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}