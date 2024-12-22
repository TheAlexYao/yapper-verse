import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTTSHandler } from "./useTTSHandler";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";

export function useMessageSubscription(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
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

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

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

      // Generate TTS for AI messages that don't have audio
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
  }, [conversationId, generateTTSForMessage, transformMessage, toast]);

  useEffect(() => {
    if (!conversationId) return;

    // Initial fetch
    fetchMessages();

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
        async () => {
          await fetchMessages();
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
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [conversationId, fetchMessages, toast]);

  return { messages };
}