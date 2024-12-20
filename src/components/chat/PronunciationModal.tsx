import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder } from "./pronunciation/AudioRecorder";
import { TextDisplay } from "./pronunciation/TextDisplay";

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: {
    text: string;
    translation: string;
    transliteration?: string;
  };
  onSubmit: (score: number, audioBlob?: Blob) => void;
  isProcessing: boolean;
}

export function PronunciationModal({
  isOpen,
  onClose,
  response,
  onSubmit,
  isProcessing,
}: PronunciationModalProps) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!audioBlob) {
      toast({
        title: "Error",
        description: "Please record your pronunciation first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit(0, audioBlob);
    } catch (error) {
      console.error('Error submitting recording:', error);
      toast({
        title: "Error",
        description: "Failed to process your recording. Please try again.",
        variant: "destructive",
      });
    }
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
          <TextDisplay {...response} />
          
          <AudioRecorder
            onRecordingComplete={(blob) => setAudioBlob(blob)}
            isProcessing={isProcessing}
          />

          {audioBlob && (
            <Button
              className="w-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Submit Recording"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}