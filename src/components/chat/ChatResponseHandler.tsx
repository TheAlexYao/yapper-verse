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
      if (!conversationId || initialMessageSent || !user?.id) return false;
      
      try {
        const response = await supabase.functions.invoke('generate-chat-response', {
          body: {
            conversationId,
            userId: user.id,
            lastMessageContent: null // This signals it's the initial message
          },
        });

        if (response.error) throw response.error;
        
        console.log('Initial AI message:', response.data);
        await onMessageSend(response.data);
        setInitialMessageSent(true);
        return true;
      } catch (error) {
        console.error('Error sending initial message:', error);
        return false;
      }
    },
    enabled: !!conversationId && !initialMessageSent && !!user?.id,
    staleTime: Infinity, // Only run once per conversation
  });

  // Then fetch recommended responses
  const { data: responses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ['responses', conversationId],
    queryFn: async () => {
      if (!user?.id || !conversationId) return [];

      console.log('Fetching responses for conversation:', conversationId);
      try {
        const response = await supabase.functions.invoke('generate-chat-response', {
          body: {
            conversationId,
            userId: user.id,
          },
        });

        if (response.error) {
          console.error('Error fetching responses:', response.error);
          throw response.error;
        }

        // Transform the response into the expected format
        const aiResponse = response.data;
        return [{
          id: crypto.randomUUID(),
          text: aiResponse.content,
          translation: aiResponse.translation,
          hint: aiResponse.hint
        }];
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