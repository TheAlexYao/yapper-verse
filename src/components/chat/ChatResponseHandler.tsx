import { useState } from "react";
import { RecommendedResponses } from "./RecommendedResponses";
import { PronunciationModal } from "./pronunciation/PronunciationModal";
import type { Message } from "@/hooks/useConversation";
import { usePronunciationHandler } from "./hooks/usePronunciationHandler";
import { useTTS } from "./hooks/useTTS";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChatResponseHandlerProps {
  onMessageSend: (message: Message) => void;
  conversationId: string;
}

export function ChatResponseHandler({ onMessageSend, conversationId }: ChatResponseHandlerProps) {
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { generateTTS, isGeneratingTTS } = useTTS();

  const { data: user } = await supabase.auth.getUser();
  
  const { data: responses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ['responses', conversationId],
    queryFn: async () => {
      const response = await fetch('/functions/v1/generate-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          conversationId,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch responses');
      }

      const data = await response.json();
      return data.responses;
    },
    enabled: !!conversationId && !!user?.id,
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
        responses={responses || []}
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