import { RecommendedResponses } from "./RecommendedResponses";
import { PronunciationHandler } from "./PronunciationHandler";
import { useResponseState } from "./hooks/useResponseState";
import { useResponseGeneration } from "./hooks/useResponseGeneration";
import { usePronunciationHandler } from "./hooks/usePronunciationHandler";
import { useTTS } from "./hooks/useTTS";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatResponseHandlerProps {
  onMessageSend: (message: Message) => void;
  conversationId: string;
}

export function ChatResponseHandler({ 
  onMessageSend, 
  conversationId 
}: ChatResponseHandlerProps) {
  const {
    selectedResponse,
    isProcessing,
    handleResponseSelect,
    resetState
  } = useResponseState();

  const { generateTTS, isGeneratingTTS } = useTTS();
  const user = useUser();
  const { toast } = useToast();

  // Use the new response generation hook
  const { 
    data: responses = [], 
    isLoading: isLoadingResponses 
  } = useResponseGeneration(conversationId);

  const { handlePronunciationComplete } = usePronunciationHandler({ 
    conversationId, 
    onMessageSend: async (message: Message) => {
      resetState();
      await onMessageSend(message);
    },
    onComplete: resetState,
    selectedResponse: selectedResponse || { text: '', translation: '' }
  });

  const handleResponseClick = async (response: any) => {
    if (isGeneratingTTS) {
      toast({
        title: "Please wait",
        description: "Audio is still being generated",
        variant: "default",
      });
      return;
    }
    
    try {
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

      await handleResponseSelect({ 
        ...response, 
        audio_url: normalAudioUrl,
        languageCode: profile.target_language
      });
    } catch (error) {
      console.error('Error preparing pronunciation practice:', error);
      toast({
        title: "Error",
        description: "Failed to prepare pronunciation practice. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <RecommendedResponses
        responses={responses}
        onSelectResponse={handleResponseClick}
        isLoading={isLoadingResponses || isGeneratingTTS}
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