import { useState } from "react";
import { RecommendedResponses } from "./RecommendedResponses";
import { PronunciationModal } from "./PronunciationModal";
import { PronunciationScoreModal } from "./PronunciationScoreModal";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { usePronunciationHandler } from "./hooks/usePronunciationHandler";
import { MOCK_RESPONSES } from "./data/mockResponses";
import { useToast } from "@/hooks/use-toast";

interface ChatResponseHandlerProps {
  onMessageSend: (message: Message) => void;
  conversationId: string;
}

// Cache for TTS responses
const ttsCache = new Map<string, string>();

export function ChatResponseHandler({ onMessageSend, conversationId }: ChatResponseHandlerProps) {
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [pronunciationData, setPronunciationData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const { toast } = useToast();

  const { handlePronunciationComplete } = usePronunciationHandler({ 
    conversationId, 
    onMessageSend: (message: Message) => {
      onMessageSend(message);
      if (message.pronunciation_data) {
        setPronunciationData(message.pronunciation_data);
        setIsProcessing(false);
      }
    },
    onComplete: () => {
      setSelectedResponse(null);
      setShowPronunciationModal(false);
    },
    selectedResponse: selectedResponse || { text: '', translation: '' }
  });

  const generateTTSForSpeed = async (response: any, profile: any, speed: 'normal' | 'slow') => {
    const cacheKey = `${response.text}-${profile.target_language}-${profile.voice_preference || 'female'}-${speed}`;
    let audioUrl = ttsCache.get(cacheKey);

    if (!audioUrl) {
      console.log(`Cache miss, generating TTS for ${speed} speed...`);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: response.text,
          languageCode: profile.target_language,
          voiceGender: profile.voice_preference || 'female',
          speed
        }
      });

      if (error) {
        console.error(`TTS function error (${speed} speed):`, error);
        throw new Error(`Failed to generate ${speed} speed speech: ${error.message}`);
      }

      if (!data?.audioUrl) {
        throw new Error(`No audio URL in response for ${speed} speed`);
      }

      audioUrl = data.audioUrl;
      ttsCache.set(cacheKey, audioUrl);
    } else {
      console.log(`Cache hit for ${speed} speed, using cached audio URL`);
    }

    return audioUrl;
  };

  const handleResponseSelect = async (response: any) => {
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

      // Generate normal speed version
      const normalSpeedUrl = await generateTTSForSpeed(response, profile, 'normal');
      
      // Generate slow speed version
      const slowSpeedUrl = await generateTTSForSpeed(response, profile, 'slow');

      console.log('Generated audio URLs:', {
        normal: normalSpeedUrl,
        slow: slowSpeedUrl
      });
      
      // Set the selected response with the audio URLs
      setSelectedResponse({ 
        ...response, 
        audio_url: normalSpeedUrl,
        audio_url_slow: slowSpeedUrl 
      });
      setShowPronunciationModal(true);
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: "Error",
        description: "Failed to generate audio for comparison. Please try again.",
        variant: "destructive",
      });
      // Still show the modal even if TTS fails
      setSelectedResponse(response);
      setShowPronunciationModal(true);
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const handlePronunciationSubmit = async (score: number, audioBlob?: Blob) => {
    setIsProcessing(true);
    await handlePronunciationComplete(score, audioBlob);
  };

  return (
    <>
      <RecommendedResponses
        responses={MOCK_RESPONSES}
        onSelectResponse={handleResponseSelect}
        isLoading={isGeneratingTTS}
      />

      {selectedResponse && (
        <PronunciationModal
          isOpen={showPronunciationModal}
          onClose={() => {
            setShowPronunciationModal(false);
            setIsProcessing(false);
          }}
          response={selectedResponse}
          onSubmit={handlePronunciationSubmit}
          isProcessing={isProcessing}
        />
      )}

      {pronunciationData && showScoreModal && (
        <PronunciationScoreModal
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          data={pronunciationData}
        />
      )}
    </>
  );
}