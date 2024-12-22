import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";

export function useMessageSubscription(
  conversationId: string | null,
  onNewMessage: (message: Message) => void
) {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up stable subscription for conversation:', conversationId);

    // Only set up a new subscription if we don't have one
    if (!channelRef.current) {
      const channel = supabase
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
              reference_audio_url: newMessage.reference_audio_url,
              isUser: newMessage.is_user
            };
            
            onNewMessage(formattedMessage);
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      channelRef.current = channel;
    }

    // Cleanup subscription only when component unmounts or conversationId changes
    return () => {
      if (channelRef.current) {
        console.log('Cleaning up subscription for conversation:', conversationId);
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [conversationId, onNewMessage]);
}