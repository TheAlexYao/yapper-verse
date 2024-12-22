import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AudioRecorder } from "../AudioRecorder";
import { TextDisplay } from "../TextDisplay";
import { AudioControls } from "./AudioControls";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: {
    text: string;
    translation?: string;
    audio_url?: string;
    languageCode?: string;
  };
  onSubmit: (score: number, audioBlob?: Blob) => void;
  isProcessing?: boolean;
}

export function PronunciationModal({
  isOpen,
  onClose,
  response,
  onSubmit,
  isProcessing = false
}: PronunciationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Practice Pronunciation</DialogTitle>
          <DialogDescription>
            Listen to the audio and record yourself saying the phrase to practice your pronunciation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <TextDisplay 
            text={response.text} 
            translation={response.translation} 
          />

          {response.audio_url && (
            <AudioControls audioUrl={response.audio_url} />
          )}

          <AudioRecorder
            onRecordingComplete={(blob) => onSubmit(0, blob)}
            isProcessing={isProcessing}
            disabled={isProcessing}
          />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          {isProcessing && (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}