import { useState } from "react";
import { RecommendedResponses } from "./RecommendedResponses";
import { PronunciationModal } from "./pronunciation/PronunciationModal";
import type { Message } from "@/hooks/useConversation";
import { usePronunciationHandler } from "./hooks/usePronunciationHandler";
import { useTTS } from "./hooks/useTTS";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatResponseHandlerProps {
  onMessageSend: (message: Message) => void;
  conversationId: string;
}

const INITIAL_AI_MESSAGE: Omit<Message, 'conversation_id'> = {
  id: crypto.randomUUID(),
  text: "Bonjour! Je suis Pierre, votre serveur aujourd'hui. Que puis-je vous servir?",
  translation: "Hello! I'm Pierre, your waiter today. What can I serve you?",
  transliteration: "bohn-ZHOOR! zhuh swee pyehr, voh-truh sehr-vuhr oh-zhoor-dwee. kuh pwee-zhuh voo sehr-veer?",
  isUser: false,
  audio_url: '',
  pronunciation_score: null,
  pronunciation_data: null,
  reference_audio_url: null
};

export function ChatResponseHandler({ onMessageSend, conversationId }: ChatResponseHandlerProps) {
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  
  const { generateTTS, isGeneratingTTS } = useTTS();
  const user = useUser();

  // First, send the initial AI message when the conversation starts
  useQuery({
    queryKey: ['initial-message', conversationId],
    queryFn: async () => {
      if (!conversationId || initialMessageSent) return false;
      
      // Send the initial AI message with the correct conversation_id
      const initialMessage: Message = {
        ...INITIAL_AI_MESSAGE,
        conversation_id: conversationId
      };
      
      console.log('Sending initial message:', initialMessage);
      await onMessageSend(initialMessage);
      setInitialMessageSent(true);
      return true;
    },
    enabled: !!conversationId && !initialMessageSent,
    staleTime: Infinity, // Only run once per conversation
  });

  // Then fetch recommended responses
  const { data: responses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ['responses', conversationId],
    queryFn: async () => {
      if (!user?.id || !conversationId) return [];

      console.log('Fetching responses for conversation:', conversationId);
      try {
        const response = await supabase.functions.invoke('generate-responses', {
          body: {
            conversationId,
            userId: user.id,
          },
        });

        if (response.error) {
          console.error('Error fetching responses:', response.error);
          throw response.error;
        }

        console.log('Received responses:', response.data?.responses);
        return response.data?.responses || [];
      } catch (error) {
        console.error('Error fetching responses:', error);
        return [];
      }
    },
    enabled: !!conversationId && !!user?.id && initialMessageSent,
    retry: 1,
  });

  const { handlePronunciationComplete } = usePronunciationHandler({ 
    conversationId, 
    onMessageSend,
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
    setIsProcessing(false);
    setShowPronunciationModal(false);
    setSelectedResponse(null);
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