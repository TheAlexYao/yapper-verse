import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";
import { useTTSHandler } from "./useTTSHandler";

// Queue class to handle TTS generation
class TTSQueue {
  private queue: Message[] = [];
  private processing = false;
  private processingMessages = new Set<string>();

  constructor(private generateTTS: (msg: Message) => Promise<void>) {}

  add(message: Message) {
    if (this.processingMessages.has(message.id)) {
      console.log('Message already in processing queue:', message.id);
      return;
    }
    
    this.processingMessages.add(message.id);
    this.queue.push(message);
    this.processNext();
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const message = this.queue.shift()!;

    try {
      await this.generateTTS(message);
    } catch (error) {
      console.error('Error generating TTS:', error);
    } finally {
      this.processingMessages.delete(message.id);
      this.processing = false;
      this.processNext();
    }
  }

  clear() {
    this.queue = [];
    this.processingMessages.clear();
    this.processing = false;
  }
}

export function useMessageSubscription(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const { generateTTSForMessage } = useTTSHandler(conversationId || '');
  const ttsQueueRef = useRef<TTSQueue | null>(null);

  // Initialize TTS queue
  useEffect(() => {
    if (!conversationId) return;
    
    ttsQueueRef.current = new TTSQueue(generateTTSForMessage);
    
    return () => {
      ttsQueueRef.current?.clear();
      ttsQueueRef.current = null;
    };
  }, [conversationId, generateTTSForMessage]);

  // Queue TTS generation for a message
  const queueTTSGeneration = useCallback((message: Message) => {
    if (!message.isUser && !message.audio_url && ttsQueueRef.current) {
      console.log('Queueing TTS generation for message:', message.id);
      ttsQueueRef.current.add(message);
    }
  }, []);

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
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'guided_conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Received message event:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
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
              // For updates, replace the existing message
              if (payload.eventType === 'UPDATE') {
                return prevMessages.map(msg => 
                  msg.id === formattedMessage.id ? formattedMessage : msg
                );
              }
              
              // For new messages, check if it already exists
              const exists = prevMessages.some(msg => msg.id === formattedMessage.id);
              if (exists) {
                console.log('Message already exists, skipping:', formattedMessage.id);
                return prevMessages;
              }
              
              // Queue TTS generation if needed
              queueTTSGeneration(formattedMessage);
              
              console.log('Adding new message to state:', formattedMessage);
              return [...prevMessages, formattedMessage];
            });
          }
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

    return () => {
      console.log('Cleaning up subscription for conversation:', conversationId);
      channel.unsubscribe();
    };
  }, [conversationId, toast, queueTTSGeneration]);

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

        // Queue TTS generation for messages without audio
        formattedMessages.forEach(msg => {
          queueTTSGeneration(msg);
        });
      }
    };

    fetchInitialMessages();
  }, [conversationId, toast, queueTTSGeneration]);

  return { messages, setMessages };
}