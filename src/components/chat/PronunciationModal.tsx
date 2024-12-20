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
import { useToast } from "@/hooks/use-toast";

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: {
    text: string;
    translation: string;
    transliteration?: string;
  };
  onSubmit: (score: number, audioBlob?: Blob) => void;
}

export function PronunciationModal({
  isOpen,
  onClose,
  response,
  onSubmit,
}: PronunciationModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        setHasRecording(true);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check your permissions.",
        variant: "destructive",
      });
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
    setAudioBlob(null);
    setHasRecording(false);
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      toast({
        title: "Error",
        description: "Please record your pronunciation first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onSubmit(0, audioBlob);
      onClose();
    } catch (error) {
      console.error('Error submitting recording:', error);
      toast({
        title: "Error",
        description: "Failed to process your recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
                disabled={isProcessing}
                className={`min-w-[140px] ${!isRecording ? "bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90" : ""}`}
              >
                <Mic className="mr-2 h-4 w-4" />
                {isRecording ? "Stop" : "Record"}
              </Button>
              {hasRecording && (
                <Button 
                  variant="outline" 
                  onClick={resetRecording}
                  disabled={isProcessing}
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

            {hasRecording && (
              <Button
                className="w-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Submit Recording"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}