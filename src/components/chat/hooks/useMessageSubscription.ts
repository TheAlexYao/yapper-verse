import { useState, useEffect, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useConversation";

export function useMessageSubscription(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const mapDatabaseMessageToMessage = (dbMessage: any): Message => ({
    id: dbMessage.id,
    text: dbMessage.content,
    isUser: dbMessage.is_user,
    translation: dbMessage.translation,
    transliteration: dbMessage.transliteration,
    audio_url: dbMessage.audio_url,
    reference_audio_url: dbMessage.reference_audio_url,
    pronunciation_score: dbMessage.pronunciation_score,
    pronunciation_data: dbMessage.pronunciation_data
  });

  // Load initial messages
  useEffect(() => {
    async function loadMessages() {
      if (!conversationId) return;

      try {
        console.log('Loading initial messages for conversation:', conversationId);
        const { data, error } = await supabase
          .from('guided_conversation_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const mappedMessages = data.map(mapDatabaseMessageToMessage);
        console.log('Setting initial messages:', mappedMessages);
        setMessages(mappedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    }

    loadMessages();
  }, [conversationId, toast]);

  // Set up realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    function setupSubscription() {
      if (channelRef.current) {
        console.log('Cleaning up existing subscription');
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      console.log('Setting up message subscription for conversation:', conversationId);
      
      channelRef.current = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'guided_conversation_messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          async (payload) => {
            console.log('Received message update:', payload);
            
            // Refresh all messages to ensure consistency
            const { data, error } = await supabase
              .from('guided_conversation_messages')
              .select('*')
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: true });

            if (error) {
              console.error('Error refreshing messages:', error);
              return;
            }

            const mappedMessages = data.map(mapDatabaseMessageToMessage);
            setMessages(mappedMessages);
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);

          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to conversation:', conversationId);
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
              retryTimeoutRef.current = undefined;
            }
          }
          
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.log('Subscription closed or errored:', status);
            // Clear any existing retry timeout
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
            }
            
            // Set up a new subscription after a delay
            retryTimeoutRef.current = setTimeout(() => {
              console.log('Attempting to reconnect subscription');
              setupSubscription();
            }, 5000); // 5 second delay before retry
          }
        });
    }

    setupSubscription();

    // Cleanup function
    return () => {
      console.log('Cleaning up subscription for conversation:', conversationId);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = undefined;
      }
    };
  }, [conversationId]);

  return { messages };
}