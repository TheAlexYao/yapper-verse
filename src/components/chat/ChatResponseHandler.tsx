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
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  
  const { generateTTS, isGeneratingTTS } = useTTS();
  const user = useUser();
  const { toast } = useToast();

  // First, send the initial AI message when the conversation starts
  const { isLoading: isLoadingInitial } = useQuery({
    queryKey: ['initial-message', conversationId],
    queryFn: async () => {
      if (!conversationId || initialMessageSent || !user?.id) return null;
      
      try {
        console.log('Generating initial message for conversation:', conversationId);
        const response = await supabase.functions.invoke('generate-chat-response', {
          body: {
            conversationId,
            userId: user.id,
            lastMessageContent: null // This signals it's the initial message
          },
        });

        if (response.error) {
          console.error('Error generating initial message:', response.error);
          toast({
            title: "Error",
            description: "Failed to start conversation. Please try again.",
            variant: "destructive",
          });
          throw response.error;
        }
        
        if (response.data) {
          console.log('Initial AI message received:', response.data);
          await onMessageSend(response.data);
          setInitialMessageSent(true);
          return response.data;
        }
      } catch (error) {
        console.error('Error sending initial message:', error);
        return null;
      }
    },
    enabled: !!conversationId && !initialMessageSent && !!user?.id,
    retry: 1,
    staleTime: Infinity, // Only run once per conversation
  });

  // Then fetch recommended responses
  const { data: responses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ['responses', conversationId],
    queryFn: async () => {
      if (!user?.id || !conversationId) return [];

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
      setShowPronunciationModal(false);
    },
    selectedResponse: selectedResponse || { text: '', translation: '' }
  });

  const handleResponseSelect = async (response: any) => {
    if (isGeneratingTTS) return;
    
    try {
      const audioUrl = await generateTTS(response.text);
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
        isLoading={isLoadingInitial || isLoadingResponses || isGeneratingTTS}
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