import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";

export function useMessageSubscription(
  conversationId: string | null,
  onNewMessage: (message: Message) => void
) {
  const channelRef = useRef<any>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const { toast } = useToast();
  const maxRetries = 5;
  const baseRetryDelay = 1000; // Start with 1 second

  const getRetryDelay = () => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(baseRetryDelay * Math.pow(2, retryCountRef.current), 16000);
  };

  const setupSubscription = useCallback(() => {
    if (!conversationId) return;

    // Don't setup a new subscription if we already have one
    if (channelRef.current?.subscription?.state === 'SUBSCRIBED') {
      console.log('Subscription already active');
      return;
    }

    console.log('Setting up stable subscription for conversation:', conversationId);

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
          retryCountRef.current = 0; // Reset retry count on successful subscription
          
          // Clear retry timeout if subscription is successful
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = undefined;
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log('Subscription closed or errored, attempting reconnect...');
          
          // Only attempt to reconnect if we haven't exceeded max retries
          if (retryCountRef.current < maxRetries) {
            const delay = getRetryDelay();
            retryCountRef.current++;
            
            retryTimeoutRef.current = setTimeout(() => {
              setupSubscription();
            }, delay);
          } else {
            toast({
              title: "Connection Error",
              description: "Failed to maintain connection. Please refresh the page.",
              variant: "destructive",
            });
          }
        }
      });

    channelRef.current = channel;
  }, [conversationId, onNewMessage, toast]);

  useEffect(() => {
    setupSubscription();

    return () => {
      console.log('Cleaning up message subscription');
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = undefined;
      }
      retryCountRef.current = 0; // Reset retry count on cleanup
    };
  }, [setupSubscription]);
}