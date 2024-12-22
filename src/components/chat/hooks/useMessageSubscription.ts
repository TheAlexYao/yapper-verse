import { useState, useEffect, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useConversation";
import { useTTSHandler } from "./useTTSHandler";

export function useMessageSubscription(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { toast } = useToast();
  const { generateTTSForMessage } = useTTSHandler(conversationId || '');
  const isLoadingRef = useRef(false);

  const mapDatabaseMessageToMessage = (dbMessage: any): Message => ({
    id: dbMessage.id,
    conversation_id: dbMessage.conversation_id,
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
  const loadMessages = async () => {
    if (!conversationId || isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
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

      // Generate TTS for AI messages that don't have audio
      mappedMessages.forEach(msg => {
        if (!msg.isUser && !msg.audio_url) {
          console.log('Generating TTS for message without audio:', msg.id);
          generateTTSForMessage(msg);
        }
      });
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      isLoadingRef.current = false;
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const setupSubscription = async () => {
      // Clean up existing subscription
      if (channelRef.current) {
        console.log('Cleaning up existing subscription');
        await channelRef.current.unsubscribe();
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
            
            // Refresh messages to ensure consistency
            await loadMessages();

            // If this is a new AI message without audio, generate TTS
            if (payload.eventType === 'INSERT') {
              const newMessage = mapDatabaseMessageToMessage(payload.new);
              if (!newMessage.isUser && !newMessage.audio_url) {
                console.log('Generating TTS for new AI message:', newMessage.id);
                generateTTSForMessage(newMessage);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to conversation:', conversationId);
            // Load initial messages after successful subscription
            loadMessages();
          }
        });
    };

    setupSubscription();

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('Cleaning up subscription');
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [conversationId]); // Only depend on conversationId

  return { messages };
}