import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Cache for TTS responses
const ttsCache = new Map<string, string>();

export function useTTS() {
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const { toast } = useToast();

  const generateTTS = async (text: string) => {
    try {
      setIsGeneratingTTS(true);
      
      // Get user profile for language and voice settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      // Check cache first
      const cacheKey = `${text}-${profile.target_language}-${profile.voice_preference || 'female'}`;
      let audioUrl = ttsCache.get(cacheKey);

      if (!audioUrl) {
        console.log('Cache miss, generating TTS...');
        
        const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
          body: {
            text: text,
            languageCode: profile.target_language,
            voiceGender: profile.voice_preference || 'female',
            speed: 'normal'
          }
        });

        if (ttsError) {
          console.error('TTS function error:', ttsError);
          throw new Error(`Failed to generate speech: ${ttsError.message}`);
        }

        if (!ttsData?.audioUrl) {
          throw new Error('No audio URL in response');
        }

        audioUrl = ttsData.audioUrl;
        // Cache the result
        ttsCache.set(cacheKey, audioUrl);
      } else {
        console.log('Cache hit, using cached audio URL');
      }

      return audioUrl;
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: "Error",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  return {
    generateTTS,
    isGeneratingTTS
  };
}