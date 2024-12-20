import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";

interface UsePronunciationHandlerProps {
  conversationId: string;
  onMessageSend: (message: Message) => void;
  onComplete: () => void;
  selectedResponse: {
    text: string;
    translation: string;
    languageCode?: string;
  };
}

export function usePronunciationHandler({ 
  conversationId, 
  onMessageSend, 
  onComplete,
  selectedResponse 
}: UsePronunciationHandlerProps) {
  const handlePronunciationComplete = async (score: number, audioBlob?: Blob) => {
    try {
      if (!audioBlob) {
        throw new Error('No audio recording provided');
      }

      if (!selectedResponse.languageCode) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        const { data: profile } = await supabase
          .from('profiles')
          .select('target_language')
          .eq('id', user.id)
          .single();

        if (!profile?.target_language) {
          throw new Error('Target language not set');
        }
        selectedResponse.languageCode = profile.target_language;
      }

      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('text', selectedResponse.text);
      formData.append('languageCode', selectedResponse.languageCode);

      console.log('Sending pronunciation assessment request with language:', selectedResponse.languageCode);

      const { data: assessmentData, error: assessmentError } = await supabase.functions
        .invoke('assess-pronunciation', {
          body: formData
        });

      if (assessmentError) {
        console.error('Assessment error:', assessmentError);
        throw assessmentError;
      }

      const { audioUrl, assessment } = assessmentData;
      const pronunciationScore = assessment.pronunciationScore || 
        (assessment.NBest?.[0]?.PronunciationAssessment?.PronScore ?? 0);

      // Create the message with pronunciation data
      const newMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        text: selectedResponse.text,
        translation: selectedResponse.translation,
        pronunciation_score: Math.round(pronunciationScore),
        pronunciation_data: assessment,
        audio_url: audioUrl,
        isUser: true,
      };

      console.log('Pronunciation score:', pronunciationScore);
      console.log('Assessment data:', assessment);

      onMessageSend(newMessage);
      onComplete();
    } catch (error) {
      console.error('Error handling pronunciation:', error);
      throw error;
    }
  };

  return { handlePronunciationComplete };
}