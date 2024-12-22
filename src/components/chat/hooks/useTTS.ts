import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useTTS() {
  const [isGeneratingTTS] = useState(false);
  const { toast } = useToast();
  const memoryCache = new Map<string, string>();

  const generateTTS = async (text: string, voicePreference: string = 'female', speed: 'normal' | 'slow' = 'normal') => {
    try {
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user profile for language settings
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('target_language')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Could not fetch user profile');
      }

      if (!profile?.target_language) {
        console.error('No target language set in profile');
        toast({
          title: "Language Setting Required",
          description: "Please set your target language in your profile settings.",
          variant: "destructive",
        });
        throw new Error('Target language not set in user profile');
      }

      // Generate a hash for the text + voice + speed + language combination
      const textHash = `${text}-${voicePreference}-${speed}-${profile.target_language}`;

      // Check memory cache first
      if (memoryCache.has(textHash)) {
        console.log('Memory cache hit, using cached audio URL');
        return memoryCache.get(textHash);
      }

      // Check database cache
      const { data: cacheData } = await supabase
        .from('tts_cache')
        .select('audio_url')
        .eq('text_hash', textHash)
        .maybeSingle();

      if (cacheData?.audio_url) {
        console.log('Database cache hit, using cached audio URL:', cacheData.audio_url);
        memoryCache.set(textHash, cacheData.audio_url);
        return cacheData.audio_url;
      }

      console.log('Cache miss, generating TTS...');

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          gender: voicePreference,
          speed,
          languageCode: profile.target_language
        }
      });

      if (error) {
        console.error('TTS generation error:', error);
        throw error;
      }

      if (!data?.audioUrl) {
        throw new Error('No audio URL returned from TTS service');
      }

      console.log('Generated new audio URL:', data.audioUrl);

      // Update memory cache
      memoryCache.set(textHash, data.audioUrl);
      return data.audioUrl;

    } catch (error) {
      console.error('TTS generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    generateTTS,
    isGeneratingTTS
  };
}