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

export function ChatResponseHandler({ onMessageSend, conversationId }: ChatResponseHandlerProps) {
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [pronunciationData, setPronunciationData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleResponseSelect = async (response: any) => {
    try {
      // Generate TTS for the selected response
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('No auth session found');
      }

      const ttsResponse = await fetch('/functions/v1/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({
          text: response.text,
          languageCode: profile.target_language,
          voiceGender: profile.voice_preference || 'female'
        })
      });

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error('TTS response error:', errorText);
        throw new Error(`Failed to generate speech: ${ttsResponse.status}`);
      }

      const ttsData = await ttsResponse.json();
      if (!ttsData.audioUrl) {
        throw new Error('No audio URL in response');
      }
      
      // Set the selected response with the audio URL
      setSelectedResponse({ ...response, audio_url: ttsData.audioUrl });
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