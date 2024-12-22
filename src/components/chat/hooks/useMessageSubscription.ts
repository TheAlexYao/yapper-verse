import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";
import { useTTS } from "./useTTS";

export function useMessageSubscription(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const { generateTTS } = useTTS();

  const generateAudioForMessage = async (content: string, messageId: string) => {
    try {
      // Create text hash for checking cache
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const textHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Check if audio already exists in cache
      const { data: cacheEntry } = await supabase
        .from('tts_cache')
        .select('audio_url')
        .eq('text_hash', textHash)
        .maybeSingle();

      if (cacheEntry?.audio_url) {
        console.log('Found cached audio for message:', messageId);
        // Update message with cached audio URL
        await supabase
          .from('guided_conversation_messages')
          .update({ audio_url: cacheEntry.audio_url })
          .eq('id', messageId);
        return cacheEntry.audio_url;
      }

      // Generate new audio if not in cache
      console.log('Generating new audio for message:', messageId);
      const audioUrl = await generateTTS(content);
      if (audioUrl) {
        await supabase
          .from('guided_conversation_messages')
          .update({ audio_url: audioUrl })
          .eq('id', messageId);
      }
      return audioUrl;
    } catch (error) {
      console.error('Error handling audio for message:', error);
      return null;
    }
  };

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
        async (payload) => {
          console.log('Received new message:', payload);
          const newMessage = payload.new;

          // Generate TTS for AI messages
          let audioUrl = newMessage.audio_url;
          if (!newMessage.is_user && !audioUrl) {
            audioUrl = await generateAudioForMessage(newMessage.content, newMessage.id);
          }

          const formattedMessage: Message = {
            id: newMessage.id,
            conversation_id: newMessage.conversation_id,
            text: newMessage.content,
            translation: newMessage.translation,
            transliteration: newMessage.transliteration,
            pronunciation_score: newMessage.pronunciation_score,
            pronunciation_data: newMessage.pronunciation_data,
            audio_url: audioUrl,
            reference_audio_url: newMessage.reference_audio_url,
            isUser: newMessage.is_user
          };

          setMessages(prevMessages => {
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
  }, [conversationId, toast, generateTTS]);

  // Effect for fetching initial messages
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
        // Process messages and generate TTS where needed
        const processedMessages = await Promise.all(messages.map(async (msg) => {
          let audioUrl = msg.audio_url;
          if (!msg.is_user && !audioUrl) {
            audioUrl = await generateAudioForMessage(msg.content, msg.id);
          }

          return {
            id: msg.id,
            conversation_id: msg.conversation_id,
            text: msg.content,
            translation: msg.translation,
            transliteration: msg.transliteration,
            pronunciation_score: msg.pronunciation_score,
            pronunciation_data: msg.pronunciation_data,
            audio_url: audioUrl,
            reference_audio_url: msg.reference_audio_url,
            isUser: msg.is_user
          };
        }));

        console.log('Setting initial messages:', processedMessages);
        setMessages(processedMessages);
      }
    };

    fetchInitialMessages();
  }, [conversationId, toast, generateTTS]);

  return { messages, setMessages };
}