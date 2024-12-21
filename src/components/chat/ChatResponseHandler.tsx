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

  // Fetch recommended responses and character info
  const { data: responses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ['responses', conversationId],
    queryFn: async () => {
      if (!user?.id || !conversationId) return [];

      try {
        // First get the conversation to get the character_id
        const { data: conversation } = await supabase
          .from('guided_conversations')
          .select('character_id')
          .eq('id', conversationId)
          .single();

        if (!conversation) {
          throw new Error('Conversation not found');
        }

        // Then get the character's gender
        const { data: character } = await supabase
          .from('characters')
          .select('gender')
          .eq('id', conversation.character_id)
          .single();

        // Get the AI response
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

        // Transform the response into the expected format and include character gender
        const aiResponse = response.data;
        return [{
          id: crypto.randomUUID(),
          text: aiResponse.content,
          translation: aiResponse.translation,
          hint: aiResponse.hint,
          characterGender: character?.gender || 'female' // Default to female if not specified
        }];
      } catch (error) {
        console.error('Error fetching responses:', error);
        return [];
      }
    },
    enabled: !!conversationId && !!user?.id,
    retry: 1,
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
      // Pass the character's gender to generateTTS
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