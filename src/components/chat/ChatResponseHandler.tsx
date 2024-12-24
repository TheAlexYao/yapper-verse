import { RecommendedResponses } from "./RecommendedResponses";
import { PronunciationHandler } from "./PronunciationHandler";
import { useResponseState } from "./hooks/useResponseState";
import { useResponseGeneration } from "./hooks/useResponseGeneration";
import { usePronunciationHandler } from "./hooks/usePronunciationHandler";
import { useTTS } from "./hooks/useTTS";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';
import { useConversationCompletion } from "./hooks/useConversationCompletion";
import type { Message } from "@/hooks/useConversation";

interface ChatResponseHandlerProps {
  onMessageSend: (message: Message) => void;
  conversationId: string;
}

export function ChatResponseHandler({ 
  onMessageSend, 
  conversationId 
}: ChatResponseHandlerProps) {
  const queryClient = useQueryClient();
  const { isCompleted } = useConversationCompletion(conversationId);
  
  const {
    selectedResponse,
    isProcessing,
    audioGenerationStatus,
    startProcessing,
    stopProcessing,
    startAudioGeneration,
    completeAudioGeneration,
    handleResponseSelect,
    resetState
  } = useResponseState();

  const { generateTTS } = useTTS();
  const user = useUser();
  const { toast } = useToast();

  const { 
    data: responses = [], 
    isLoading: isLoadingResponses 
  } = useResponseGeneration(conversationId);

  const { handlePronunciationComplete } = usePronunciationHandler({ 
    conversationId, 
    onMessageSend: async (message: Message) => {
      console.log('ChatResponseHandler - Message send triggered');
      resetState();
      await onMessageSend(message);
    },
    onComplete: resetState,
    selectedResponse: selectedResponse || { text: '', translation: '' }
  });

  const handleResponseClick = async (response: any) => {
    if (isCompleted) {
      toast({
        title: "Conversation completed",
        description: "This conversation has been completed. Please view your feedback.",
        variant: "default",
      });
      return;
    }

    console.log('handleResponseClick - Starting with response:', response);
    
    if (audioGenerationStatus === 'generating') {
      toast({
        title: "Please wait",
        description: "Audio is still being generated",
        variant: "default",
      });
      return;
    }
    
    try {
      startProcessing();
      startAudioGeneration();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', user?.id)
        .single();

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      console.log('Generating reference audio for:', response.text);
      const normalAudioUrl = await generateTTS(
        response.text, 
        profile.voice_preference || 'female',
        'normal'
      );
      
      if (!normalAudioUrl) {
        throw new Error('Failed to generate reference audio');
      }

      completeAudioGeneration();

      await handleResponseSelect({ 
        ...response, 
        audio_url: normalAudioUrl,
        languageCode: profile.target_language
      });

      // Invalidate responses cache after selection
      queryClient.invalidateQueries({
        queryKey: ['responses', conversationId],
      });
    } catch (error) {
      console.error('Error preparing pronunciation practice:', error);
      toast({
        title: "Error",
        description: "Failed to prepare pronunciation practice. Please try again.",
        variant: "destructive",
      });
      resetState();
    } finally {
      stopProcessing();
    }
  };

  if (isCompleted) {
    return null;
  }

  return (
    <>
      <RecommendedResponses
        responses={responses}
        onSelectResponse={handleResponseClick}
        isLoading={isLoadingResponses || audioGenerationStatus === 'generating'}
      />

      <PronunciationHandler
        selectedResponse={selectedResponse}
        isProcessing={isProcessing}
        onClose={resetState}
        onSubmit={handlePronunciationComplete}
      />
    </>
  );
}