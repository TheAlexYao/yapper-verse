import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";

export function useMessageHandling(conversationId: string | null) {
  const handleMessageSend = useCallback(async (message: Message) => {
    if (!conversationId) return;

    try {
      console.log('Handling message send:', { conversationId, messageContent: message.text });
      
      // First insert the user's message
      const { error: insertError } = await supabase
        .from('guided_conversation_messages')
        .insert({
          conversation_id: conversationId,
          content: message.text,
          translation: message.translation,
          transliteration: message.transliteration,
          is_user: true,
          pronunciation_score: message.pronunciation_score,
          pronunciation_data: message.pronunciation_data,
          audio_url: message.audio_url,
        });

      if (insertError) {
        console.error('Error inserting message:', insertError);
        throw insertError;
      }

      console.log('Message inserted successfully, generating AI response');

      // Then generate AI response
      await supabase.functions.invoke('generate-chat-response', {
        body: {
          conversationId,
          lastMessageContent: message.text
        },
      });

      console.log('AI response generation triggered successfully');
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }, [conversationId]);

  return { handleMessageSend };
}