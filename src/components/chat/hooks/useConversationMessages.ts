import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTTSHandler } from './useTTSHandler';
import type { Message } from '@/hooks/useConversation';

// Create a stable reference for active subscriptions
const activeSubscriptions = new Map<string, ReturnType<typeof supabase.channel>>();

export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const { generateTTSForMessage } = useTTSHandler(conversationId || '');
  const processingMessagesRef = useRef<Set<string>>(new Set());
  const isLoadingRef = useRef(false);

  // Load initial messages
  useEffect(() => {
    if (!conversationId || isLoadingRef.current) return;

    const loadMessages = async () => {
      try {
        isLoadingRef.current = true;
        console.log('Loading initial messages for conversation:', conversationId);
        
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

        console.log('Setting initial messages:', formattedMessages.length);
        setMessages(formattedMessages);
        
        // Process TTS for messages that need it
        formattedMessages.forEach(msg => {
          if (processingMessagesRef.current.has(msg.id)) return;
          if ((!msg.audio_url && !msg.isUser) || (!msg.reference_audio_url && msg.isUser)) {
            processingMessagesRef.current.add(msg.id);
            generateTTSForMessage(msg).finally(() => {
              processingMessagesRef.current.delete(msg.id);
            });
          }
        });
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadMessages();
  }, [conversationId, toast, generateTTSForMessage]);

  // Set up real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    // Check if subscription already exists
    if (activeSubscriptions.has(conversationId)) {
      console.log('Subscription already exists for:', conversationId);
      return;
    }

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
          
          if (processingMessagesRef.current.has(newMessage.id)) return;
          if ((!newMessage.audio_url && !newMessage.isUser) || (!newMessage.reference_audio_url && newMessage.isUser)) {
            processingMessagesRef.current.add(newMessage.id);
            generateTTSForMessage(newMessage).finally(() => {
              processingMessagesRef.current.delete(newMessage.id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    activeSubscriptions.set(conversationId, channel);

    return () => {
      console.log('Cleaning up message subscription');
      if (activeSubscriptions.has(conversationId)) {
        const sub = activeSubscriptions.get(conversationId);
        if (sub) {
          supabase.removeChannel(sub);
          activeSubscriptions.delete(conversationId);
        }
      }
    };
  }, [conversationId]); // Only depend on conversationId

  return { messages };
}