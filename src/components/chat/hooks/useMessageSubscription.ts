import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";

export function useMessageSubscription(
  conversationId: string | null,
  onNewMessage: (message: Message) => void
) {
  const channelRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!conversationId) return;

    // Don't setup a new subscription if we already have one
    if (channelRef.current?.subscription?.state === 'SUBSCRIBED') {
      console.log('Subscription already active');
      return;
    }

    console.log('Setting up message subscription for conversation:', conversationId);

    // Clean up existing subscription if any
    if (channelRef.current) {
      console.log('Cleaning up existing subscription');
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

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
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to conversation:', conversationId);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          toast({
            title: "Connection Error",
            description: "Failed to maintain connection. Please refresh the page.",
            variant: "destructive",
          });
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up message subscription');
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [conversationId, onNewMessage, toast]);
}