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
  const isSettingUp = useRef(false);

  // Load initial messages
  useEffect(() => {
    if (!conversationId) return;

    async function loadMessages() {
      try {
        console.log('Loading initial messages for conversation:', conversationId);
        const { data, error } = await supabase
          .from('guided_conversation_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const mappedMessages = data.map(msg => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          text: msg.content,
          isUser: msg.is_user,
          translation: msg.translation,
          transliteration: msg.transliteration,
          audio_url: msg.audio_url,
          reference_audio_url: msg.reference_audio_url,
          pronunciation_score: msg.pronunciation_score,
          pronunciation_data: msg.pronunciation_data
        }));

        console.log('Setting initial messages:', mappedMessages);
        setMessages(mappedMessages);

        // Generate TTS for AI messages that don't have audio
        mappedMessages.forEach(msg => {
          if (!msg.isUser && !msg.audio_url) {
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
      }
    }

    loadMessages();
  }, [conversationId, toast, generateTTSForMessage]);

  // Set up realtime subscription
  useEffect(() => {
    if (!conversationId || isSettingUp.current) return;

    async function setupSubscription() {
      if (channelRef.current) {
        console.log('Cleaning up existing subscription');
        await channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      isSettingUp.current = true;
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

            const mappedMessages = data.map(msg => ({
              id: msg.id,
              conversation_id: msg.conversation_id,
              text: msg.content,
              isUser: msg.is_user,
              translation: msg.translation,
              transliteration: msg.transliteration,
              audio_url: msg.audio_url,
              reference_audio_url: msg.reference_audio_url,
              pronunciation_score: msg.pronunciation_score,
              pronunciation_data: msg.pronunciation_data
            }));

            setMessages(mappedMessages);

            // If this is a new AI message without audio, generate TTS
            if (payload.eventType === 'INSERT') {
              const newMessage = mappedMessages.find(m => m.id === payload.new.id);
              if (newMessage && !newMessage.isUser && !newMessage.audio_url) {
                generateTTSForMessage(newMessage);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);

          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to conversation:', conversationId);
            isSettingUp.current = false;
          }
        });
    }

    setupSubscription();

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('Cleaning up subscription for conversation:', conversationId);
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      isSettingUp.current = false;
    };
  }, [conversationId]); // Only depend on conversationId

  return { messages };
}