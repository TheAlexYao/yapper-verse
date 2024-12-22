import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";
import { useTTSHandler } from "./useTTSHandler";

export function useMessageSubscription(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const { generateTTSForMessage } = useTTSHandler(conversationId || '');

  // Effect for setting up the subscription
  useEffect(() => {
    if (!conversationId) {
      console.log('No conversation ID provided');
      return;
    }

    console.log('Setting up message subscription for conversation:', conversationId);
    
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

          setMessages(prevMessages => {
            // Check if message already exists
            const exists = prevMessages.some(msg => msg.id === formattedMessage.id);
            if (exists) {
              console.log('Message already exists, skipping:', formattedMessage.id);
              return prevMessages;
            }
            console.log('Adding new message to state:', formattedMessage);
            return [...prevMessages, formattedMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to conversation:', conversationId);
        }
        if (status === 'CLOSED') {
          toast({
            title: "Connection closed",
            description: "Reconnecting to chat...",
            variant: "default",
          });
        }
      });

    // Cleanup function
    return () => {
      console.log('Cleaning up subscription for conversation:', conversationId);
      channel.unsubscribe();
    };
  }, [conversationId, toast]);

  // Effect for fetching initial messages and generating TTS
  useEffect(() => {
    if (!conversationId) return;

    const fetchInitialMessages = async () => {
      const { data: messages, error } = await supabase
        .from('guided_conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to fetch messages. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (messages) {
        const formattedMessages = messages.map((msg): Message => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          text: msg.content,
          translation: msg.translation,
          transliteration: msg.transliteration,
          pronunciation_score: msg.pronunciation_score,
          pronunciation_data: msg.pronunciation_data,
          audio_url: msg.audio_url,
          reference_audio_url: msg.reference_audio_url,
          isUser: msg.is_user
        }));
        
        console.log('Setting initial messages:', formattedMessages);
        setMessages(formattedMessages);

        // Generate TTS for AI messages without audio
        formattedMessages.forEach(msg => {
          if (!msg.isUser && !msg.audio_url) {
            console.log('Generating TTS for message without audio:', msg.id);
            generateTTSForMessage(msg);
          }
        });
      }
    };

    fetchInitialMessages();
  }, [conversationId, toast, generateTTSForMessage]);

  return { messages, setMessages };
}