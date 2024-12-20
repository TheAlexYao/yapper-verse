import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";

interface UsePronunciationHandlerProps {
  conversationId: string;
  onMessageSend: (message: Message) => void;
  onComplete: () => void;
}

export function usePronunciationHandler({ 
  conversationId, 
  onMessageSend, 
  onComplete 
}: UsePronunciationHandlerProps) {
  const handlePronunciationComplete = async (score: number, audioBlob?: Blob) => {
    try {
      if (!audioBlob) {
        throw new Error('No audio recording provided');
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      // Call the assess-pronunciation edge function
      const { data: assessmentData, error: assessmentError } = await supabase.functions
        .invoke('assess-pronunciation', {
          body: formData
        });

      if (assessmentError) {
        console.error('Assessment error:', assessmentError);
        throw assessmentError;
      }

      const { audioUrl, assessment } = assessmentData;

      // Create the message with pronunciation data
      const newMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        text: selectedResponse.text,
        translation: selectedResponse.translation,
        pronunciation_score: assessment.pronunciationScore,
        pronunciation_data: assessment,
        audio_url: audioUrl,
        isUser: true,
      };

      // Update conversation metrics
      const { error: metricsError } = await supabase
        .from('guided_conversations')
        .update({
          metrics: {
            pronunciationScore: assessment.pronunciationScore,
            sentencesUsed: 1,
            sentenceLimit: 10
          }
        })
        .eq('id', conversationId);

      if (metricsError) {
        console.error('Error updating metrics:', metricsError);
      }

      onMessageSend(newMessage);
      onComplete();
    } catch (error) {
      console.error('Error handling pronunciation:', error);
      // You might want to show a toast here
    }
  };

  return { handlePronunciationComplete };
}