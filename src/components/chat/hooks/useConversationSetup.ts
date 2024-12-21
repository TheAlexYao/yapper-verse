import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useConversation";
import { setupLanguages } from "./conversation/useLanguageSetup";
import { 
  fetchExistingConversation, 
  createNewConversation,
  fetchConversationMessages 
} from "./conversation/useConversationQuery";

export function useConversationSetup(character: any, scenario: any) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  // Set up subscription
  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up message subscription for conversation:', conversationId);
    
    // Clean up existing subscription if any
    if (channelRef.current) {
      console.log('Cleaning up existing subscription');
      channelRef.current.unsubscribe();
    }

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
      );

    // Store channel reference
    channelRef.current = channel;

    // Subscribe to channel
    channel.subscribe((status: string) => {
      console.log('Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to conversation:', conversationId);
      }
    });

    return () => {
      console.log('Cleaning up message subscription');
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [conversationId]);

  // Main setup effect
  useEffect(() => {
    const setupConversation = async () => {
      if (!character?.id || !scenario?.id) {
        console.log('Missing character or scenario ID');
        return;
      }

      try {
        const { nativeLanguageId, targetLanguageId, userId } = await setupLanguages();
        
        const existingConversation = await fetchExistingConversation(
          userId,
          character.id,
          scenario.id
        );

        let newConversationId: string;

        if (existingConversation) {
          console.log('Found existing conversation:', existingConversation.id);
          newConversationId = existingConversation.id;
        } else {
          const newConversation = await createNewConversation(
            userId,
            character.id,
            scenario.id,
            nativeLanguageId,
            targetLanguageId
          );

          console.log('Created new conversation:', newConversation.id);
          newConversationId = newConversation.id;

          // Generate initial AI message for new conversations
          const { error: generateError } = await supabase.functions.invoke('generate-chat-response', {
            body: {
              conversationId: newConversationId,
              userId,
              isInitialMessage: true
            },
          });

          if (generateError) {
            console.error('Error generating initial message:', generateError);
            throw generateError;
          }

          console.log('Initial message generation triggered');
        }

        setConversationId(newConversationId);

        // Fetch initial messages
        const initialMessages = await fetchConversationMessages(newConversationId);
        console.log('Setting initial messages:', initialMessages);
        setMessages(initialMessages);

      } catch (error) {
        console.error('Error setting up conversation:', error);
        toast({
          title: "Error",
          description: "Failed to set up conversation. Please try again.",
          variant: "destructive",
        });
      }
    };

    setupConversation();
  }, [character?.id, scenario?.id, toast]);

  return { conversationId, messages, setMessages };
}