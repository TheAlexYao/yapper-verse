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

      console.log('Received assessment data:', assessmentData);

      const { audioUrl, assessment } = assessmentData;
      
      // Extract the pronunciation assessment from NBest array
      const nBestResult = assessment.NBest?.[0];
      const pronunciationAssessment = nBestResult?.PronunciationAssessment;
      
      // Get the overall scores
      const accuracyScore = pronunciationAssessment?.AccuracyScore ?? 0;
      const fluencyScore = pronunciationAssessment?.FluencyScore ?? 0;
      const completenessScore = pronunciationAssessment?.CompletenessScore ?? 0;
      const pronunciationScore = pronunciationAssessment?.PronScore ?? 
                               assessment.pronunciationScore ?? 0;

      // Get the word-by-word analysis
      const words = nBestResult?.Words?.map(word => ({
        Word: word.Word,
        PronunciationAssessment: {
          AccuracyScore: word.PronunciationAssessment?.AccuracyScore ?? 0,
          ErrorType: word.PronunciationAssessment?.ErrorType ?? 'None'
        }
      })) ?? [];

      console.log('Creating new message with pronunciation data:', {
        accuracyScore,
        fluencyScore,
        completenessScore,
        pronunciationScore,
        words
      });
      
      // Create the message with detailed pronunciation data and both audio URLs
      const newMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        text: selectedResponse.text,
        translation: selectedResponse.translation,
        pronunciation_score: Math.round(pronunciationScore),
        pronunciation_data: {
          NBest: [{
            PronunciationAssessment: {
              AccuracyScore: accuracyScore,
              FluencyScore: fluencyScore,
              CompletenessScore: completenessScore,
              PronScore: pronunciationScore
            },
            Words: words
          }]
        },
        audio_url: audioUrl,
        reference_audio_url: selectedResponse.audio_url,
        isUser: true,
      };

      console.log('Attempting to send message:', newMessage);
      
      // Send the message and wait for it to complete
      await onMessageSend(newMessage);
      
      console.log('Message sent successfully, completing pronunciation flow');
      
      // Only complete after message is sent successfully
      onComplete();
    } catch (error) {
      console.error('Error handling pronunciation:', error);
      throw error;
    }
  };

  return { handlePronunciationComplete };
}