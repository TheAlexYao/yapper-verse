import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface AudioPlaybackProps {
  text: string;
}

export function useAudioPlayback({ text }: AudioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // Fetch user profile data
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const playAudio = async (speed: 'normal' | 'slow') => {
    try {
      setIsPlaying(true);

      if (!profile?.target_language || !profile?.voice_preference) {
        toast({
          title: "Settings not configured",
          description: "Please set your language and voice preferences in your profile settings.",
          variant: "destructive",
        });
        return;
      }

      // Create a safe cache key using URL-safe base64 encoding
      const cacheKeyText = `${text}-${profile.target_language}-${profile.voice_preference}-${speed}`;
      const cacheKey = btoa(encodeURIComponent(cacheKeyText));
      
      console.log('TTS Request:', {
        text,
        languageCode: profile.target_language,
        voiceGender: profile.voice_preference,
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
          text,
          languageCode: profile.target_language,
          voiceGender: profile.voice_preference,
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
          text_content: text,
          language_code: profile.target_language,
          voice_gender: profile.voice_preference,
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
    } finally {
      setIsPlaying(false);
    }
  };

  return {
    playAudio,
    isPlaying,
    isLoadingProfile
  };
}