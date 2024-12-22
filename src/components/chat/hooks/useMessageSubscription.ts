import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTTSHandler } from "./useTTSHandler";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";

export function useMessageSubscription(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isLoadingMessages = useRef(false);
  const isMounted = useRef(true);
  const { toast } = useToast();
  const { generateTTSForMessage } = useTTSHandler(conversationId || '');

  // Transform database message to Message type
  const transformMessage = useCallback((msg: any): Message => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    text: msg.content,
    translation: msg.translation,
    transliteration: msg.transliteration,
    isUser: msg.is_user,
    audio_url: msg.audio_url,
    pronunciation_score: msg.pronunciation_score,
    pronunciation_data: msg.pronunciation_data,
    reference_audio_url: msg.reference_audio_url,
  }), []);

  // Memoize the fetchMessages function
  const fetchMessages = useCallback(async () => {
    if (!conversationId || isLoadingMessages.current || !isMounted.current) return;

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

      if (!isMounted.current) return;

      // Transform the messages
      const transformedMessages = messagesData.map(transformMessage);
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
  }, [conversationId, generateTTSForMessage, transformMessage]);

  // Memoize the setupSubscription function
  const setupSubscription = useCallback(async () => {
    if (!conversationId || !isMounted.current) return;

    try {
      console.log('Setting up message subscription for conversation:', conversationId);
      
      // Clean up existing subscription if any
      if (channelRef.current) {
        await channelRef.current.unsubscribe();
        channelRef.current = null;
      }

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
          async () => {
            if (!isMounted.current) return;
            console.log('Received message update');
            await fetchMessages();
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);

          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to conversation:', conversationId);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.log('Subscription closed or errored:', status);
            
            if (!isMounted.current) return;

            toast({
              title: "Connection Error",
              description: "Failed to maintain connection. Please refresh the page.",
              variant: "destructive",
            });
          }
        });
    } catch (error) {
      console.error('Error setting up subscription:', error);
    }
  }, [conversationId, fetchMessages, toast]);

  // Set up subscription when conversationId changes
  useEffect(() => {
    if (!conversationId) return;
    
    isMounted.current = true;
    fetchMessages();
    setupSubscription();

    // Cleanup function
    return () => {
      isMounted.current = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [conversationId, fetchMessages, setupSubscription]);

  return { messages };
}