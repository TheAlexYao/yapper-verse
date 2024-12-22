import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTTSHandler } from "./useTTSHandler";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";
import debounce from 'lodash/debounce';

export function useMessageSubscription(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { toast } = useToast();
  const { generateTTSForMessage } = useTTSHandler(conversationId || '');
  const lastFetchRef = useRef<number>(0);

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

  // Debounced fetch to prevent rapid re-fetches
  const debouncedFetch = useCallback(
    debounce(async () => {
      if (!conversationId) return;

      const now = Date.now();
      // Prevent fetching if less than 1 second has passed since last fetch
      if (now - lastFetchRef.current < 1000) {
        return;
      }
      lastFetchRef.current = now;

      try {
        console.log('Fetching messages for conversation:', conversationId);
        const { data: messagesData, error } = await supabase
          .from('guided_conversation_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const transformedMessages = messagesData.map(transformMessage);
        setMessages(transformedMessages);

        // Generate TTS only for new AI messages that don't have audio
        for (const message of transformedMessages) {
          if (!message.isUser && !message.audio_url) {
            await generateTTSForMessage(message);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    }, 500),
    [conversationId, generateTTSForMessage, toast, transformMessage]
  );

  useEffect(() => {
    if (!conversationId) return;

    // Initial fetch
    debouncedFetch();

    // Set up subscription
    const channel = supabase
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
          // Only fetch if the change is not just an audio_url update
          if (payload.eventType === 'UPDATE') {
            const newFields = payload.new as any;
            const oldFields = payload.old as any;
            const hasContentChange = newFields.content !== oldFields.content;
            
            if (!hasContentChange) {
              // If it's just an audio update, update the message locally
              setMessages(prev => prev.map(msg => 
                msg.id === newFields.id 
                  ? { ...msg, audio_url: newFields.audio_url }
                  : msg
              ));
              return;
            }
          }
          
          await debouncedFetch();
        }
      )
      .subscribe((status) => {
        if (status === 'CLOSED') {
          toast({
            title: "Connection Lost",
            description: "Please refresh the page to reconnect.",
            variant: "destructive",
          });
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      debouncedFetch.cancel();
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [conversationId, debouncedFetch, toast]);

  return { messages };
}