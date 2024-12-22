import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";
import { useTTSHandler } from "./useTTSHandler";
import { TTSQueue } from "./tts/TTSQueue";
import { useMessageChannel } from "./messages/useMessageChannel";
import { formatDatabaseMessage } from "./messages/messageFormatters";

export function useMessageSubscription(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { generateTTSForMessage } = useTTSHandler(conversationId || '');
  const ttsQueueRef = useRef<TTSQueue | null>(null);
  const { toast } = useToast();

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

  // Set up message subscription
  useMessageChannel(conversationId, setMessages, queueTTSGeneration);

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
        const formattedMessages = messages.map(formatDatabaseMessage);
        console.log('Setting initial messages:', formattedMessages);
        setMessages(formattedMessages);

        formattedMessages.forEach(queueTTSGeneration);
      }
    };

    fetchInitialMessages();
  }, [conversationId, toast, queueTTSGeneration]);

  return { messages, setMessages };
}