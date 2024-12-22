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
    audio_url?: string;
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
      console.log('Starting pronunciation handling with score:', score);
      
      // Step 1: Validate audio data
      if (!audioBlob) {
        throw new Error('No audio recording provided');
      }

      // Step 2: Ensure language code is available
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

      // Step 3: Prepare assessment request
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('text', selectedResponse.text);
      formData.append('languageCode', selectedResponse.languageCode);

      // Step 4: Send for assessment
      console.log('Sending assessment request with formData:', {
        text: selectedResponse.text,
        languageCode: selectedResponse.languageCode
      });

      const { data: assessmentData, error: assessmentError } = await supabase.functions
        .invoke('assess-pronunciation', {
          body: formData
        });

      if (assessmentError) {
        console.error('Assessment error:', assessmentError);
        throw assessmentError;
      }

      console.log('Received assessment data:', assessmentData);

      // Step 5: Extract assessment results with null checks
      const { audioUrl, assessment } = assessmentData || {};
      
      if (!assessment) {
        throw new Error('No assessment data received');
      }

      // Get pronunciation score with fallback
      const pronunciationScore = assessment.NBest?.[0]?.PronunciationAssessment?.PronScore || 0;
      
      // Step 6: Create message with assessment data
      const newMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        text: selectedResponse.text,
        translation: selectedResponse.translation,
        pronunciation_score: Math.round(pronunciationScore),
        pronunciation_data: assessment,
        audio_url: audioUrl,
        reference_audio_url: selectedResponse.audio_url,
        isUser: true,
      };

      console.log('Created new message with assessment:', newMessage);

      // Step 7: Send message and update UI
      await onMessageSend(newMessage);
      onComplete();
    } catch (error) {
      console.error('Error handling pronunciation:', error);
      throw error;
    }
  };

  return { handlePronunciationComplete };
}