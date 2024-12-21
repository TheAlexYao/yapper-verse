import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TextDisplayProps {
  text: string;
  translation: string;
  transliteration?: string;
  audio_url?: string;
  phonetics?: string;
}

export function TextDisplay({ text, translation, transliteration, audio_url, phonetics }: TextDisplayProps) {
  const [isGeneratingSlowAudio, setIsGeneratingSlowAudio] = useState(false);
  const [slowAudioUrl, setSlowAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayNormalAudio = () => {
    if (audio_url && audioRef.current) {
      audioRef.current.src = audio_url;
      audioRef.current.play();
    }
  };

  const handleGenerateSlowAudio = async () => {
    try {
      setIsGeneratingSlowAudio(true);
      
      // Get user profile for language settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      // Generate slow audio
      const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          languageCode: profile.target_language,
          voiceGender: profile.voice_preference || 'female',
          speed: 'slow'
        }
      });

      if (ttsError) {
        throw ttsError;
      }

      setSlowAudioUrl(ttsData.audioUrl);
      
      // Play the slow audio immediately after generating
      if (audioRef.current) {
        audioRef.current.src = ttsData.audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error generating slow audio:', error);
    } finally {
      setIsGeneratingSlowAudio(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/50">
        <div className="flex-1 space-y-1">
          <div className="space-y-1">
            <p className="font-medium">{text}</p>
            {phonetics && (
              <p className="text-sm font-mono text-muted-foreground">
                /{phonetics}/
              </p>
            )}
          </div>
          {transliteration && (
            <p className="text-sm italic text-muted-foreground">
              {transliteration}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{translation}</p>
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}