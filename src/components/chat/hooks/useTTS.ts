import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Cache for TTS responses
const ttsCache = new Map<string, string>();

export function useTTS() {
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const { toast } = useToast();

  const generateTTS = async (text: string, characterGender: string = 'female') => {
    if (!text?.trim()) {
      console.error('No text provided for TTS generation');
      toast({
        title: "Error",
        description: "No text provided for speech generation",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsGeneratingTTS(true);
      
      // Get user profile for language settings
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('target_language')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch user profile');
      }

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      // Map character gender to voice gender
      const voiceGender = characterGender.toLowerCase() === 'male' ? 'male' : 'female';

      // Validate all required parameters before proceeding
      const params = {
        text: text.trim(),
        languageCode: profile.target_language,
        voiceGender: voiceGender,
        speed: 'normal'
      };

      // Check cache first
      const cacheKey = `${params.text}-${params.languageCode}-${params.voiceGender}`;
      let audioUrl = ttsCache.get(cacheKey);

      if (!audioUrl) {
        console.log('Cache miss, generating TTS...');
        
        const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
          body: params
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
        description: error.message || "Failed to generate audio. Please try again.",
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