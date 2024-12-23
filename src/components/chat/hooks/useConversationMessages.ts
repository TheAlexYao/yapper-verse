import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTTSHandler } from './useTTSHandler';
import type { Message } from '@/hooks/useConversation';

export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const { generateTTSForMessage } = useTTSHandler(conversationId || '');

  // Load initial messages
  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('guided_conversation_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          text: msg.content,
          translation: msg.translation,
          transliteration: msg.transliteration,
          isUser: msg.is_user,
          audio_url: msg.audio_url,
          pronunciation_score: msg.pronunciation_score,
          pronunciation_data: msg.pronunciation_data,
          reference_audio_url: msg.reference_audio_url
        }));

        setMessages(formattedMessages);

        // Generate TTS only for messages that need it
        formattedMessages.forEach(msg => {
          if ((!msg.audio_url && !msg.isUser) || (!msg.reference_audio_url && msg.isUser)) {
            generateTTSForMessage(msg);
          }
        });
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadMessages();
  }, [conversationId, toast, generateTTSForMessage]);

  // Set up real-time subscription once
  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up message subscription for conversation:', conversationId);
    
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guided_conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            conversation_id: payload.new.conversation_id,
            text: payload.new.content,
            translation: payload.new.translation,
            transliteration: payload.new.transliteration,
            isUser: payload.new.is_user,
            audio_url: payload.new.audio_url,
            pronunciation_score: payload.new.pronunciation_score,
            pronunciation_data: payload.new.pronunciation_data,
            reference_audio_url: payload.new.reference_audio_url
          };

          setMessages(prev => [...prev, newMessage]);

          // Generate TTS only if needed
          if ((!newMessage.audio_url && !newMessage.isUser) || 
              (!newMessage.reference_audio_url && newMessage.isUser)) {
            generateTTSForMessage(newMessage);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up message subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId, generateTTSForMessage]); // Only re-run if these change

  return { messages };
}