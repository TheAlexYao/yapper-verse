import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mic, Play, RefreshCw, Volume2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setHasRecording(true);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleRecord = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setHasRecording(false);
    setShowResults(false);
  };

  const handleSubmit = () => {
    setShowResults(true);
    // Simulated score for now
    const score = Math.floor(Math.random() * 30) + 70;
    onSubmit(score);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Pronunciation Check</DialogTitle>
          <DialogDescription>
            Listen to the correct pronunciation and record your attempt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/50">
              <Button variant="secondary" size="icon" className="shrink-0">
                <Volume2 className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <p className="font-medium">{response.text}</p>
                <p className="text-sm text-muted-foreground">{response.translation}</p>
                {response.transliteration && (
                  <p className="text-sm italic text-muted-foreground">
                    {response.transliteration}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                variant={isRecording ? "destructive" : "default"}
                onClick={handleRecord}
                className="min-w-[140px]"
              >
                <Mic className="mr-2 h-4 w-4" />
                {isRecording ? "Stop" : "Record"}
              </Button>
              {hasRecording && (
                <Button 
                  variant="outline" 
                  onClick={resetRecording}
                  className="min-w-[140px]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>

            {audioUrl && (
              <div className="p-4 rounded-lg bg-accent/50">
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}

            {hasRecording && !showResults && (
              <Button
                className="w-full"
                onClick={handleSubmit}
                variant="default"
              >
                Submit Recording
              </Button>
            )}

            {showResults && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-6 bg-card">
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-primary">85%</div>
                    <Progress value={85} className="h-2" />
                    <div className="text-sm text-muted-foreground">
                      Pronunciation Score
                    </div>
                  </div>
                  <div className="mt-6">
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
                  variant="default"
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}