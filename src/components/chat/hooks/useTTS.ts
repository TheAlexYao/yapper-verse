import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useTTS() {
  const [isGeneratingTTS] = useState(false);
  const { toast } = useToast();
  const memoryCache = new Map<string, string>();

  const generateTTS = async (text: string, voicePreference: string = 'female', speed: 'normal' | 'slow' = 'normal') => {
    try {
      // Generate a hash for the text + voice + speed combination
      const textHash = `${text}-${voicePreference}-${speed}`;

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

      const response = await fetch('/functions/v1/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          text,
          gender: voicePreference,
          speed
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate speech');
      }

      const { audioUrl } = await response.json();
      
      if (!audioUrl) {
        throw new Error('No audio URL returned from TTS service');
      }

      console.log('Generated new audio URL:', audioUrl);

      // Update memory cache
      memoryCache.set(textHash, audioUrl);
      return audioUrl;

    } catch (error) {
      console.error('TTS generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate audio. Please try again.",
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