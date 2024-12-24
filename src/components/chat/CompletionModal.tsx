import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: {
    pronunciationScore: number;
    stylePoints: number;
    sentencesUsed: number;
  };
}

export function CompletionModal({ isOpen, onClose, metrics }: CompletionModalProps) {
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
            <Button onClick={onClose}>
              Continue Practice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}