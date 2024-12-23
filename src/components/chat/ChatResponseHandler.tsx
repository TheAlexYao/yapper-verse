import { useState } from "react";
import { RecommendedResponses } from "./RecommendedResponses";
import { PronunciationModal } from "./pronunciation/PronunciationModal";
import type { Message } from "@/hooks/useConversation";
import { usePronunciationHandler } from "./hooks/usePronunciationHandler";
import { useTTS } from "./hooks/useTTS";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatResponseHandlerProps {
  onMessageSend: (message: Message) => void;
  conversationId: string;
}

export function ChatResponseHandler({ onMessageSend, conversationId }: ChatResponseHandlerProps) {
  // State for managing response selection and modal visibility
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { generateTTS, isGeneratingTTS } = useTTS();
  const user = useUser();
  const { toast } = useToast();

  // Flow Step 1: Fetch AI responses when conversation loads
  const { data: responses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ['responses', conversationId],
    queryFn: async () => {
      if (!user?.id || !conversationId) return [];

      try {
        const { data, error } = await supabase.functions.invoke('generate-responses', {
          body: {
            conversationId,
            userId: user.id,
          },
        });

        if (error) {
          console.error('Error fetching responses:', error);
          throw error;
        }

        return data.responses || [];
      } catch (error) {
        console.error('Error fetching responses:', error);
        toast({
          title: "Error",
          description: "Failed to generate responses. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!conversationId && !!user?.id,
  });

  // Flow Step 4: Handle completion of pronunciation assessment
  const { handlePronunciationComplete } = usePronunciationHandler({ 
    conversationId, 
    onMessageSend,
    onComplete: () => {
      // IMPROVEMENT NEEDED: Modal should close here before waiting for AI response
      setSelectedResponse(null);
      setShowPronunciationModal(false);
      setIsProcessing(false);
    },
    selectedResponse: selectedResponse || { text: '', translation: '' }
  });

  // Flow Step 2: Handle response selection and TTS generation
  const handleResponseSelect = async (response: any) => {
    if (isGeneratingTTS) {
      toast({
        title: "Please wait",
        description: "Audio is still being generated",
        variant: "default",
      });
      return;
    }
    
    try {
      // Get user's voice preference
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', user?.id)
        .single();

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      // Generate reference audio for pronunciation comparison
      console.log('Generating reference audio for:', response.text);
      const normalAudioUrl = await generateTTS(
        response.text, 
        profile.voice_preference || 'female',
        'normal'
      );
      
      if (!normalAudioUrl) {
        throw new Error('Failed to generate reference audio');
      }

      // Store response with generated audio URL and open modal
      setSelectedResponse({ 
        ...response, 
        audio_url: normalAudioUrl,
        languageCode: profile.target_language
      });
      setShowPronunciationModal(true);
    } catch (error) {
      console.error('Error preparing pronunciation practice:', error);
      toast({
        title: "Error",
        description: "Failed to prepare pronunciation practice. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Flow Step 3: Handle pronunciation submission
  const handlePronunciationSubmit = async (score: number, audioBlob?: Blob) => {
    if (!selectedResponse) {
      toast({
        title: "Error",
        description: "No response selected. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Starting pronunciation submission with score:', score);
      // IMPROVEMENT NEEDED: Add UI feedback when audio quality is too low
      await handlePronunciationComplete(score, audioBlob);
      console.log('Pronunciation submission completed successfully');
    } catch (error) {
      console.error('Error handling pronunciation:', error);
      toast({
        title: "Error",
        description: "Failed to process pronunciation. Please try again.",
        variant: "destructive",
      });
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