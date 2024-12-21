import { useState } from "react";
import { RecommendedResponses } from "./RecommendedResponses";
import { PronunciationModal } from "./pronunciation/PronunciationModal";
import type { Message } from "@/hooks/useConversation";
import { usePronunciationHandler } from "./hooks/usePronunciationHandler";
import { useTTS } from "./hooks/useTTS";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { INITIAL_AI_MESSAGE } from "./data/mockResponses";

interface ChatResponseHandlerProps {
  onMessageSend: (message: Message) => void;
  conversationId: string;
}

export function ChatResponseHandler({ onMessageSend, conversationId }: ChatResponseHandlerProps) {
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { generateTTS, isGeneratingTTS } = useTTS();
  const user = useUser();
  
  // First, send the initial AI message when the conversation starts
  const { data: initialMessageSent } = useQuery({
    queryKey: ['initial-message', conversationId],
    queryFn: async () => {
      if (!conversationId) return false;
      
      // Send the initial AI message
      await onMessageSend(INITIAL_AI_MESSAGE);
      return true;
    },
    enabled: !!conversationId,
    staleTime: Infinity, // Only run once per conversation
  });

  // Then fetch recommended responses
  const { data: responses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ['responses', conversationId],
    queryFn: async () => {
      if (!user?.id || !conversationId) return [];

      const response = await supabase.functions.invoke('generate-responses', {
        body: {
          conversationId,
          userId: user.id,
        },
      });

      if (response.error) {
        console.error('Error fetching responses:', response.error);
        throw new Error(response.error.message);
      }

      return response.data?.responses || [];
    },
    enabled: !!conversationId && !!user?.id && !!initialMessageSent,
  });

  const { handlePronunciationComplete } = usePronunciationHandler({ 
    conversationId, 
    onMessageSend: (message: Message) => {
      onMessageSend(message);
      setIsProcessing(false);
      setShowPronunciationModal(false);
      setSelectedResponse(null);
    },
    onComplete: () => {
      setSelectedResponse(null);
    },
    selectedResponse: selectedResponse || { text: '', translation: '' }
  });

  const handleResponseSelect = async (response: any) => {
    const audioUrl = await generateTTS(response.text);
    setSelectedResponse({ ...response, audio_url: audioUrl });
    setShowPronunciationModal(true);
  };

  const handlePronunciationSubmit = async (score: number, audioBlob?: Blob) => {
    setIsProcessing(true);
    await handlePronunciationComplete(score, audioBlob);
  };

  return (
    <>
      <RecommendedResponses
        responses={responses}
        onSelectResponse={handleResponseSelect}
        isLoading={isLoadingResponses || isGeneratingTTS}
      />

      {selectedResponse && showPronunciationModal && (
        <PronunciationModal
          isOpen={showPronunciationModal}
          onClose={() => {
            setShowPronunciationModal(false);
            setIsProcessing(false);
            setSelectedResponse(null);
          }}
          response={selectedResponse}
          onSubmit={handlePronunciationSubmit}
          isProcessing={isProcessing}
        />
      )}
    </>
  );
}