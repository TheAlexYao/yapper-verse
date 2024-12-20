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
import { supabase } from "@/integrations/supabase/client";

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: {
    text: string;
    translation: string;
    transliteration?: string;
    audio_url?: string;
    languageCode?: string;
    voiceGender?: string;
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

  // Function to handle dynamic generation of very slow audio if needed
  const handleSpeedChange = async (speed: string) => {
    if (speed === 'very_slow' && response.audio_url) {
      // Extract the text and language from the URL or response
      const urlParts = response.audio_url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const [textHash] = filename.split('_');

      // Check if very slow version exists, if not generate it
      const { data: cacheEntry } = await supabase
        .from('tts_cache')
        .select('audio_url_very_slow')
        .eq('text_hash', textHash)
        .single();

      if (!cacheEntry?.audio_url_very_slow) {
        console.log('Generating very slow version...');
        const { data, error } = await supabase.functions.invoke('text-to-speech', {
          body: {
            text: response.text,
            languageCode: response.languageCode,
            gender: response.voiceGender || 'female',
            speed: 0.5
          }
        });

        if (error) {
          console.error('Error generating very slow audio:', error);
          toast({
            title: "Error",
            description: "Failed to generate slower version. Please try again.",
            variant: "destructive",
          });
          return;
        }

        console.log('Generated very slow version:', data);
      }
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
          <TextDisplay 
            {...response}
            onSpeedChange={handleSpeedChange}
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