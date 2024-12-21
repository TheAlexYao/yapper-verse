import { useState } from "react";
import { RecommendedResponses } from "./RecommendedResponses";
import { PronunciationModal } from "./pronunciation/PronunciationModal";
import type { Message } from "@/hooks/useConversation";
import { usePronunciationHandler } from "./hooks/usePronunciationHandler";
import { useTTS } from "./hooks/useTTS";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // First fetch AI response
  const { data: aiResponse, isLoading: isLoadingAIResponse } = useQuery({
    queryKey: ['ai-response', conversationId],
    queryFn: async () => {
      if (!user?.id || !conversationId) return null;

      try {
        const response = await supabase.functions.invoke('generate-chat-response', {
          body: {
            conversationId,
            userId: user.id,
          },
        });

        if (response.error) {
          console.error('Error fetching AI response:', response.error);
          throw response.error;
        }

        return response.data;
      } catch (error) {
        console.error('Error fetching AI response:', error);
        return null;
      }
    },
    enabled: !!conversationId && !!user?.id,
  });

  // Then fetch character info and prepare responses
  const { data: responses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ['responses', conversationId, aiResponse],
    queryFn: async () => {
      if (!aiResponse || !user?.id) return [];

      try {
        // Get character info
        const { data: conversation } = await supabase
          .from('guided_conversations')
          .select('character_id')
          .eq('id', conversationId)
          .single();

        if (!conversation) {
          throw new Error('Conversation not found');
        }

        const { data: character } = await supabase
          .from('characters')
          .select('gender')
          .eq('id', conversation.character_id)
          .single();

        // Transform the AI response into the expected format
        return [{
          id: crypto.randomUUID(),
          text: aiResponse.content,
          translation: aiResponse.translation,
          hint: aiResponse.hint,
          characterGender: character?.gender || 'female'
        }];
      } catch (error) {
        console.error('Error preparing responses:', error);
        return [];
      }
    },
    enabled: !!aiResponse && !!user?.id,
  });

  const { handlePronunciationComplete } = usePronunciationHandler({ 
    conversationId, 
    onMessageSend,
    onComplete: () => {
      setSelectedResponse(null);
      setShowPronunciationModal(false);
    },
    selectedResponse: selectedResponse || { text: '', translation: '' }
  });

  const handleResponseSelect = async (response: any) => {
    if (isGeneratingTTS) return;
    
    try {
      const audioUrl = await generateTTS(response.text, response.characterGender);
      setSelectedResponse({ ...response, audio_url: audioUrl });
      setShowPronunciationModal(true);
    } catch (error) {
      console.error('Error generating TTS:', error);
      toast({
        title: "Error",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePronunciationSubmit = async (score: number, audioBlob?: Blob) => {
    setIsProcessing(true);
    try {
      await handlePronunciationComplete(score, audioBlob);
    } catch (error) {
      console.error('Error handling pronunciation:', error);
      toast({
        title: "Error",
        description: "Failed to process pronunciation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <RecommendedResponses
        responses={responses}
        onSelectResponse={handleResponseSelect}
        isLoading={isLoadingAIResponse || isLoadingResponses || isGeneratingTTS}
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