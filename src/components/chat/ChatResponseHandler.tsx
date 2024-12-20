import { useState } from "react";
import { RecommendedResponses } from "./RecommendedResponses";
import { PronunciationModal } from "./PronunciationModal";
import { PronunciationScoreModal } from "./PronunciationScoreModal";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { usePronunciationHandler } from "./hooks/usePronunciationHandler";
import { MOCK_RESPONSES } from "./data/mockResponses";

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

  const handleResponseSelect = (response: any) => {
    setSelectedResponse(response);
    setShowPronunciationModal(true);
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