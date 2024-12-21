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

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: {
    text: string;
    translation: string;
    transliteration?: string;
    audio_url?: string;
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

  const generateAudio = async (speed: 'normal' | 'slow') => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      // Create a hash for caching that includes the speed
      const textToHash = `${response.text}-${profile.target_language}-${profile.voice_preference || 'female'}-${speed}`;
      const textBuffer = new TextEncoder().encode(textToHash);
      const hashBuffer = await crypto.subtle.digest('SHA-256', textBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Check cache first
      const { data: cachedAudio } = await supabase
        .from('tts_cache')
        .select('audio_url')
        .eq('text_hash', hashHex)
        .single();

      if (cachedAudio?.audio_url) {
        const audio = new Audio(cachedAudio.audio_url);
        audio.play();
        return;
      }

      // Generate new audio if not cached
      const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: response.text,
          languageCode: profile.target_language,
          voiceGender: profile.voice_preference || 'female',
          speed: speed
        }
      });

      if (ttsError) throw ttsError;
      if (!ttsData?.audioUrl) throw new Error('No audio URL in response');

      // Cache the result
      await supabase.from('tts_cache').insert({
        text_hash: hashHex,
        text_content: response.text,
        language_code: profile.target_language,
        voice_gender: profile.voice_preference || 'female',
        audio_url: ttsData.audioUrl
      });

      const audio = new Audio(ttsData.audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Error",
        description: "Failed to play audio. Please try again.",
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
              className="flex-1 border-2 border-[#9b87f5] hover:bg-[#9b87f5]/10 hover:text-[#9b87f5]"
              onClick={() => generateAudio('normal')}
            >
              <Play className="mr-2 h-4 w-4" />
              Normal Speed
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-2 border-[#7E69AB] hover:bg-[#7E69AB]/10 hover:text-[#7E69AB]"
              onClick={() => generateAudio('slow')}
            >
              <Turtle className="mr-2 h-4 w-4" />
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