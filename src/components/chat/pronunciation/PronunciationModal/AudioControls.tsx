import { Button } from "@/components/ui/button";
import { Play, Turtle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AudioControlsProps {
  response: {
    text: string;
    audio_url?: string;
  };
}

export function AudioControls({ response }: AudioControlsProps) {
  const { toast } = useToast();

  const handlePlayNormalSpeed = () => {
    if (response.audio_url) {
      const audio = new Audio(response.audio_url);
      audio.play();
    }
  };

  const handlePlaySlowSpeed = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      const cacheKey = encodeURIComponent(`${response.text}-${profile.target_language}-${profile.voice_preference || 'female'}-slow`);
      
      const { data: cachedAudio } = await supabase
        .from('tts_cache')
        .select('audio_url')
        .eq('text_hash', cacheKey)
        .single();

      if (cachedAudio?.audio_url) {
        const audio = new Audio(cachedAudio.audio_url);
        audio.play();
        return;
      }

      const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: response.text,
          languageCode: profile.target_language,
          voiceGender: profile.voice_preference || 'female',
          speed: 'slow'
        }
      });

      if (ttsError) throw ttsError;
      if (!ttsData?.audioUrl) throw new Error('No audio URL in response');

      await supabase
        .from('tts_cache')
        .insert({
          text_hash: cacheKey,
          text_content: response.text,
          language_code: profile.target_language,
          voice_gender: profile.voice_preference || 'female',
          audio_url: ttsData.audioUrl
        });

      const audio = new Audio(ttsData.audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error playing slow audio:', error);
      toast({
        title: "Error",
        description: "Failed to play slow speed audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="flex-1 border-2 border-[#38b6ff] hover:bg-[#38b6ff]/10 hover:text-[#38b6ff] transition-colors"
        onClick={handlePlayNormalSpeed}
      >
        <Play className="mr-2 h-4 w-4" />
        Normal Speed
      </Button>
      <Button
        variant="outline"
        className="flex-1 border-2 border-[#7843e6] hover:bg-[#7843e6]/10 hover:text-[#7843e6] transition-colors"
        onClick={handlePlaySlowSpeed}
      >
        <Turtle className="mr-2 h-6 w-6" />
        Slow Speed
      </Button>
    </div>
  );
}