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
import { AudioRecorder } from "../AudioRecorder";
import { TextDisplay } from "../TextDisplay";
import { AudioControls } from "./AudioControls";
import { useTTS } from "../../hooks/useTTS";
import { supabase } from "@/integrations/supabase/client";

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: {
    text: string;
    translation: string;
    transliteration?: string;
    audio_url?: string;
    phonetics?: string;
    languageCode?: string;
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
  const [slowAudioUrl, setSlowAudioUrl] = useState<string | null>(null);
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

      // For slow speed, check if we already generated it
      if (speed === 'slow' && slowAudioUrl) {
        const audio = new Audio(slowAudioUrl);
        await audio.play();
        return;
      }

      // Get user profile for voice settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('voice_preference')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!response.languageCode) {
        throw new Error('Language code not set');
      }

      // Generate slow speed audio on demand
      console.log('Generating slow speed audio for:', response.text);
      const audioUrl = await generateTTS(
        response.text, 
        profile?.voice_preference || 'female', 
        'slow'
      );

      if (!audioUrl) {
        throw new Error('Failed to generate audio');
      }

      // Cache the slow audio URL
      if (speed === 'slow') {
        setSlowAudioUrl(audioUrl);
      }

      const audio = new Audio(audioUrl);
      await audio.play();
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
          
          <AudioControls 
            onPlayNormal={() => playAudio('normal')}
            onPlaySlow={() => playAudio('slow')}
            isGenerating={isGeneratingTTS}
          />
          
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