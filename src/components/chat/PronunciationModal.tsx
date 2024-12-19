import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mic, Volume2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PronunciationResults } from "@/components/chat/PronunciationResults";

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
  const [results, setResults] = useState<any>(null);
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
    setResults(null);
  };

  const handleSubmit = () => {
    // Simulated score and analysis for now
    const mockResults = {
      score: 85,
      words: [
        { word: response.text.split(" ")[0], score: 90, isCorrect: true },
        { word: response.text.split(" ")[1], score: 75, isCorrect: false },
      ],
      aiTips: [
        "Focus on the 'r' sound in the second word",
        "Try to emphasize the stress on the first syllable",
        "Practice the vowel sounds more carefully",
      ],
    };
    
    setResults(mockResults);
    setShowResults(true);
    onSubmit(mockResults.score);
  };

  const handleClose = () => {
    resetRecording();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            {showResults ? "Pronunciation Results" : "Pronunciation Check"}
          </DialogTitle>
          {!showResults && (
            <DialogDescription>
              Listen to the correct pronunciation and record your attempt
            </DialogDescription>
          )}
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/50">
                <Button variant="secondary" size="icon" className="shrink-0">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{response.text}</p>
                  {response.transliteration && (
                    <p className="text-sm italic text-muted-foreground">
                      {response.transliteration}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{response.translation}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  onClick={handleRecord}
                  className={`min-w-[140px] ${!isRecording ? "bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90" : ""}`}
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
                    <Mic className="mr-2 h-4 w-4" />
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
                  className="w-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
                  onClick={handleSubmit}
                >
                  Submit Recording
                </Button>
              )}
            </div>
          </div>
        ) : (
          <PronunciationResults
            score={results.score}
            transcript={response.text}
            words={results.words}
            userAudioUrl={audioUrl}
            originalAudioUrl="/mock-audio.mp3"
            aiTips={results.aiTips}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}