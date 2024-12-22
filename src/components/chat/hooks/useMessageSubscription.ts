import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTTSHandler } from "./useTTSHandler";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";

export function useMessageSubscription(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isLoadingMessages = useRef(false);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const { toast } = useToast();
  const { generateTTSForMessage } = useTTSHandler(conversationId || '');

  // Memoize the fetchMessages function to prevent unnecessary re-renders
  const fetchMessages = useCallback(async () => {
    if (!conversationId || isLoadingMessages.current) return;

    try {
      isLoadingMessages.current = true;
      console.log('Fetching messages for conversation:', conversationId);

      const { data: messagesData, error } = await supabase
        .from('guided_conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Transform the messages to match the Message type
      const transformedMessages: Message[] = messagesData.map(msg => ({
        id: msg.id,
        text: msg.content,
        translation: msg.translation,
        transliteration: msg.transliteration,
        isUser: msg.is_user,
        audio_url: msg.audio_url,
        pronunciation_score: msg.pronunciation_score,
        pronunciation_data: msg.pronunciation_data,
        reference_audio_url: msg.reference_audio_url,
      }));

      setMessages(transformedMessages);

      // Generate TTS for AI messages that don't have audio
      for (const message of transformedMessages) {
        if (!message.isUser && !message.audio_url) {
          await generateTTSForMessage(message);
        }
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      isLoadingMessages.current = false;
    }
  }, [conversationId, generateTTSForMessage]);

  // Calculate exponential backoff delay with jitter
  const getBackoffDelay = useCallback(() => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const exponentialDelay = baseDelay * Math.pow(2, reconnectAttemptsRef.current);
    const jitter = Math.random() * 1000; // Add up to 1 second of random jitter
    return Math.min(exponentialDelay + jitter, maxDelay);
  }, []);

  // Memoize the setupSubscription function
  const setupSubscription = useCallback(async () => {
    if (!conversationId) return;

    // Clean up any existing subscription
    if (channelRef.current) {
      console.log('Cleaning up existing subscription');
      await channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    // Clean up any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      // Set up realtime subscription
      channelRef.current = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'guided_conversation_messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          async (payload) => {
            console.log('Received message update:', payload);

            // Fetch all messages again to ensure consistency
            await fetchMessages();
          }
        )
        .subscribe(async (status) => {
          console.log('Subscription status:', status);

          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to messages');
            reconnectAttemptsRef.current = 0;
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.log('Subscription closed or errored:', status);
            
            // Clean up the current channel
            if (channelRef.current) {
              await channelRef.current.unsubscribe();
              channelRef.current = null;
            }

            // Implement exponential backoff for reconnection
            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
              const delay = getBackoffDelay();
              console.log(`Scheduling reconnection attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts} in ${delay}ms...`);
              
              reconnectTimeoutRef.current = window.setTimeout(async () => {
                console.log('Attempting to reconnect subscription');
                reconnectAttemptsRef.current++;
                await setupSubscription();
              }, delay);
            } else {
              console.log('Max reconnection attempts reached');
              toast({
                title: "Connection Error",
                description: "Failed to maintain connection. Please refresh the page.",
                variant: "destructive",
              });
            }
          }
        });
    } catch (error) {
      console.error('Error setting up subscription:', error);
    }
  }, [conversationId, fetchMessages, getBackoffDelay, toast]);

  // Set up subscription when conversationId changes
  useEffect(() => {
    fetchMessages();
    setupSubscription();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [conversationId, fetchMessages, setupSubscription]); // Remove messages from dependencies

  return { messages };
}