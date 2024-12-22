import { useState, useEffect, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useConversation";
import { useTTSHandler } from "./useTTSHandler";

export function useMessageSubscription(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const hasInitializedRef = useRef(false);
  const isLoadingMessages = useRef(false);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const { toast } = useToast();
  const { generateTTSForMessage } = useTTSHandler(conversationId || '');

  // Map database message to Message type
  const mapDatabaseMessage = (msg: any): Message => ({
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
  });

  // Load initial messages
  const loadMessages = async () => {
    if (!conversationId || isLoadingMessages.current) return;

    try {
      isLoadingMessages.current = true;
      console.log('Loading initial messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('guided_conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mappedMessages = data.map(mapDatabaseMessage);
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
    } finally {
      isLoadingMessages.current = false;
    }
  };

  // Calculate exponential backoff delay
  const getBackoffDelay = () => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = baseDelay * Math.pow(2, reconnectAttemptsRef.current);
    return Math.min(delay, maxDelay);
  };

  // Set up realtime subscription with reconnection handling
  const setupSubscription = async () => {
    if (!conversationId || channelRef.current) return;

    // Clean up any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
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
          
          // Handle different types of changes
          switch (payload.eventType) {
            case 'INSERT': {
              const newMessage = mapDatabaseMessage(payload.new);
              setMessages(prev => [...prev, newMessage]);
              
              // Generate TTS for new AI messages
              if (!newMessage.isUser && !newMessage.audio_url) {
                generateTTSForMessage(newMessage);
              }
              break;
            }
            case 'UPDATE': {
              const updatedMessage = mapDatabaseMessage(payload.new);
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === updatedMessage.id ? updatedMessage : msg
                )
              );
              break;
            }
            case 'DELETE': {
              const deletedId = payload.old.id;
              setMessages(prev => 
                prev.filter(msg => msg.id !== deletedId)
              );
              break;
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);

        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to conversation:', conversationId);
          reconnectAttemptsRef.current = 0;
        }

        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log('Subscription closed or errored:', status);
          
          // Clean up the current channel
          if (channelRef.current) {
            channelRef.current.unsubscribe();
            channelRef.current = null;
          }

          // Implement exponential backoff for reconnection
          if (!reconnectTimeoutRef.current) {
            const delay = getBackoffDelay();
            console.log(`Scheduling reconnection attempt in ${delay}ms...`);
            
            reconnectTimeoutRef.current = window.setTimeout(() => {
              console.log('Attempting to reconnect subscription');
              reconnectAttemptsRef.current++;
              setupSubscription();
            }, delay);
          }
        }
      });
  };

  // Set up subscription and load initial messages
  useEffect(() => {
    if (!hasInitializedRef.current && conversationId) {
      hasInitializedRef.current = true;
      loadMessages();
      setupSubscription();
    }

    // Cleanup function
    return () => {
      hasInitializedRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (channelRef.current) {
        console.log('Cleaning up subscription for conversation:', conversationId);
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      reconnectAttemptsRef.current = 0;
    };
  }, [conversationId]); // Only depend on conversationId

  return { messages };
}