import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mic, Play, RefreshCw } from "lucide-react";

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: {
    text: string;
    translation: string;
    transliteration?: string;
  };
  onSubmit: (score: number) => void;
}

export function PronunciationModal({
  isOpen,
  onClose,
  response,
  onSubmit,
}: PronunciationModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setHasRecording(false);
      setShowResults(false);
    } else {
      setHasRecording(true);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
    // Simulated score for now
    const score = Math.floor(Math.random() * 30) + 70;
    onSubmit(score);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pronunciation Check</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Play className="h-4 w-4" />
              </Button>
              <div className="text-sm text-muted-foreground">
                Listen to the correct pronunciation
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">{response.text}</p>
            <p className="text-sm text-muted-foreground">{response.translation}</p>
            {response.transliteration && (
              <p className="text-sm italic text-muted-foreground">
                {response.transliteration}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                variant={isRecording ? "destructive" : "default"}
                onClick={handleRecord}
              >
                <Mic className="mr-2 h-4 w-4" />
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
              {hasRecording && (
                <Button variant="outline" onClick={() => setHasRecording(false)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Record Again
                </Button>
              )}
            </div>

            {hasRecording && !showResults && (
              <Button
                className="w-full"
                onClick={handleSubmit}
              >
                Submit Recording
              </Button>
            )}

            {showResults && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">85%</div>
                    <div className="text-sm text-muted-foreground">
                      Pronunciation Score
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Tips:</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      <li>Pay attention to the stress on the second syllable</li>
                      <li>Try to soften the 'r' sound at the end</li>
                    </ul>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    onSubmit(85);
                    onClose();
                  }}
                >
                  Confirm & Send
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}