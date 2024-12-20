import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  utterance: {
    text: string;
    metrics: {
      accuracy: number;
      fluency: number;
      completeness: number;
      overall: number;
    };
    words: Array<{
      word: string;
      score: number;
      phonetic: string;
    }>;
    improvementTip?: string;
  };
}

export function PronunciationModal({ isOpen, onClose, utterance }: PronunciationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pronunciation Analysis</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-lg font-medium">{utterance.text}</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Accuracy</span>
                <span>{utterance.metrics.accuracy}%</span>
              </div>
              <Progress value={utterance.metrics.accuracy} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Fluency</span>
                <span>{utterance.metrics.fluency}%</span>
              </div>
              <Progress value={utterance.metrics.fluency} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Completeness</span>
                <span>{utterance.metrics.completeness}%</span>
              </div>
              <Progress value={utterance.metrics.completeness} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall</span>
                <span>{utterance.metrics.overall}%</span>
              </div>
              <Progress value={utterance.metrics.overall} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Word-by-Word Analysis</h4>
            <div className="space-y-2">
              {utterance.words.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{word.word}</p>
                    <p className="text-sm text-muted-foreground">{word.phonetic}</p>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    word.score >= 90 ? "text-green-600" :
                    word.score >= 75 ? "text-yellow-600" :
                    "text-red-600"
                  )}>
                    {word.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {utterance.improvementTip && (
            <div className="p-4 rounded-lg bg-accent/50">
              <h4 className="font-medium mb-2">Improvement Tip</h4>
              <p className="text-sm text-muted-foreground">{utterance.improvementTip}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const audio = new Audio("/native-speaker-audio.mp3");
                audio.play();
              }}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Listen to Native Speaker
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}