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
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      // Default to 'female' if voice_preference is not set
      const voiceGender = profile.voice_preference || 'female';

      // Create a safe cache key using URL-safe base64 encoding
      const cacheKeyText = `${response.text}-${profile.target_language}-${voiceGender}-${speed}`;
      const cacheKey = btoa(cacheKeyText).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      console.log('TTS Request:', {
        text: response.text,
        languageCode: profile.target_language,
        voiceGender,
        speed,
        cacheKey
      });
      
      // Check cache first
      const { data: cachedAudio, error: cacheError } = await supabase
        .from('tts_cache')
        .select('audio_url')
        .eq('text_hash', cacheKey)
        .single();

      if (cacheError) {
        console.log('Cache lookup error:', cacheError);
      }

      if (cachedAudio?.audio_url) {
        console.log('Cache hit, playing cached audio');
        const audio = new Audio(cachedAudio.audio_url);
        await audio.play();
        return;
      }

      console.log('Cache miss, generating TTS...');

      // Generate new audio if not cached
      const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: response.text,
          languageCode: profile.target_language,
          voiceGender,
          speed
        }
      });

      if (ttsError) {
        console.error('TTS error:', ttsError);
        throw ttsError;
      }

      if (!ttsData?.audioUrl) {
        throw new Error('No audio URL in response');
      }

      // Cache the audio
      const { error: insertError } = await supabase
        .from('tts_cache')
        .insert({
          text_hash: cacheKey,
          text_content: response.text,
          language_code: profile.target_language,
          voice_gender: voiceGender,
          audio_url: ttsData.audioUrl
        });

      if (insertError) {
        console.error('Cache insert error:', insertError);
      }

      const audio = new Audio(ttsData.audioUrl);
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
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-2 border-[#38b6ff] hover:bg-[#38b6ff]/10 hover:text-[#38b6ff] transition-colors"
              onClick={() => playAudio('normal')}
            >
              <Play className="mr-2 h-4 w-4" />
              Normal Speed
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-2 border-[#7843e6] hover:bg-[#7843e6]/10 hover:text-[#7843e6] transition-colors"
              onClick={() => playAudio('slow')}
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