import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";
import { useTTS } from "./useTTS";

export function useMessageSubscription(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const { generateTTS } = useTTS();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const hasInitializedRef = useRef(false);
  const retryAttemptsRef = useRef(0);
  const MAX_RETRY_ATTEMPTS = 3;

  const generateAudioForMessage = async (content: string, messageId: string) => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const textHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { data: cacheEntry } = await supabase
        .from('tts_cache')
        .select('audio_url')
        .eq('text_hash', textHash)
        .maybeSingle();

      if (cacheEntry?.audio_url) {
        console.log('Found cached audio for message:', messageId);
        return cacheEntry.audio_url;
      }

      console.log('Cache miss, generating TTS...');
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

  // Effect for fetching initial messages
  useEffect(() => {
    if (!conversationId || hasInitializedRef.current) return;

    const fetchInitialMessages = async () => {
      try {
        const { data: messages, error } = await supabase
          .from('guided_conversation_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (messages) {
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
          hasInitializedRef.current = true;
        }
      } catch (error) {
        console.error('Error in fetchInitialMessages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchInitialMessages();
  }, [conversationId, toast, generateTTS]);

  // Effect for setting up the subscription
  useEffect(() => {
    if (!conversationId || !hasInitializedRef.current || channelRef.current) return;

    console.log('Setting up message subscription for conversation:', conversationId);
    
    const setupSubscription = () => {
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
              if (exists) return prevMessages;
              return [...prevMessages, formattedMessage];
            });
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            channelRef.current = channel;
            retryAttemptsRef.current = 0;
            console.log('Successfully subscribed to conversation:', conversationId);
          }
          
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.log('Subscription closed or errored:', status);
            
            // Only retry if we haven't exceeded max attempts
            if (retryAttemptsRef.current < MAX_RETRY_ATTEMPTS) {
              retryAttemptsRef.current++;
              console.log(`Retrying subscription (attempt ${retryAttemptsRef.current}/${MAX_RETRY_ATTEMPTS})`);
              
              // Clean up existing subscription
              if (channelRef.current) {
                channelRef.current.unsubscribe();
                channelRef.current = null;
              }
              
              // Retry after a short delay
              setTimeout(setupSubscription, 1000 * retryAttemptsRef.current);
            } else if (!channelRef.current) {
              toast({
                title: "Connection issue",
                description: "Unable to connect to chat. Please refresh the page.",
                variant: "destructive",
              });
            }
          }
        });
    };

    setupSubscription();

    // Cleanup function
    return () => {
      console.log('Cleaning up subscription for conversation:', conversationId);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      retryAttemptsRef.current = 0;
    };
  }, [conversationId, toast, generateTTS]);

  return { messages, setMessages };
}