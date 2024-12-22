import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { Dispatch, SetStateAction } from "react";

export function setupMessageSubscription(
  conversationId: string,
  setMessages: Dispatch<SetStateAction<Message[]>>
) {
  return supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'guided_conversation_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log('Received new message:', payload);
        const newMessage = payload.new;
        const formattedMessage: Message = {
          id: newMessage.id,
          conversation_id: newMessage.conversation_id,
          text: newMessage.content,
          translation: newMessage.translation,
          transliteration: newMessage.transliteration,
          pronunciation_score: newMessage.pronunciation_score,
          pronunciation_data: newMessage.pronunciation_data,
          audio_url: newMessage.audio_url,
          isUser: newMessage.is_user
        };
        
        setMessages(prevMessages => [...prevMessages, formattedMessage]);
      }
    )
    .subscribe();
}