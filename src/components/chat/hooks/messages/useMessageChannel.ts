import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";
import { formatDatabaseMessage } from './messageFormatters';

export const useMessageChannel = (
  conversationId: string | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  queueTTSGeneration: (message: Message) => void
) => {
  const { toast } = useToast();

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
          event: '*',
          schema: 'public',
          table: 'guided_conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Received message event:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const formattedMessage = formatDatabaseMessage(payload.new);
            console.log('Formatted message:', formattedMessage);

            setMessages(prevMessages => {
              // For updates, replace the existing message
              if (payload.eventType === 'UPDATE') {
                console.log('Updating existing message:', formattedMessage.id);
                return prevMessages.map(msg => 
                  msg.id === formattedMessage.id ? formattedMessage : msg
                );
              }
              
              // For inserts, check if message already exists
              const exists = prevMessages.some(msg => msg.id === formattedMessage.id);
              if (exists) {
                console.log('Message already exists, skipping:', formattedMessage.id);
                return prevMessages;
              }
              
              // Queue TTS generation for new messages
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
  }, [conversationId, setMessages, queueTTSGeneration, toast]);
};