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
import { Play, Turtle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTTS } from "./hooks/useTTS";

// Change this import
import { PronunciationScoreModal } from "@/components/chat/pronunciation/PronunciationScoreModal";

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: {
    text: string;
    translation: string;
    transliteration?: string;
    audio_url?: string;
    phonetics?: string;
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
  const { generateTTS, isGeneratingTTS } = useTTS();

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

  const playAudio = async (speed: 'normal' | 'slow') => {
    try {
      // For normal speed, use the pre-generated audio URL
      if (speed === 'normal' && response.audio_url) {
        const audio = new Audio(response.audio_url);
        await audio.play();
        return;
      }

      // For slow speed or if normal speed audio is missing, generate on demand
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      // Generate audio on-demand for slow speed
      const audioUrl = await generateTTS(response.text, profile.voice_preference || 'female', speed);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        await audio.play();
      }
    } catch (error) {
      console.error(`Error playing ${speed} audio:`, error);
      toast({
        title: "Error",
        description: `Failed to play ${speed} speed audio. Please try again.`,
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
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-2 border-[#38b6ff] hover:bg-[#38b6ff]/10 hover:text-[#38b6ff] transition-colors"
              onClick={() => playAudio('normal')}
              disabled={isGeneratingTTS}
            >
              <Play className="mr-2 h-4 w-4" />
              Normal Speed
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-2 border-[#7843e6] hover:bg-[#7843e6]/10 hover:text-[#7843e6] transition-colors"
              onClick={() => playAudio('slow')}
              disabled={isGeneratingTTS}
            >
              <Turtle className="mr-2 h-6 w-6" />
              Slow Speed
            </Button>
          </div>
          
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
