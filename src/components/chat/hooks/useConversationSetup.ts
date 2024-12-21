import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useConversation";
import { setupLanguages } from "./conversation/useLanguageSetup";
import { setupMessageSubscription } from "./conversation/useMessageSubscription";
import { 
  fetchExistingConversation, 
  createNewConversation,
  fetchConversationMessages 
} from "./conversation/useConversationQuery";

export function useConversationSetup(character: any, scenario: any) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

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

        // Subscribe to new messages
        const subscription = setupMessageSubscription(newConversationId, setMessages);

        return () => {
          subscription.unsubscribe();
        };

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