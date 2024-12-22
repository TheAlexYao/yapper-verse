import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMessageSubscription } from "./useMessageSubscription";
import { 
  fetchExistingConversation, 
  createNewConversation,
} from "./conversation/useConversationQuery";

export function useConversationSetup(character: any, scenario: any) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { messages } = useMessageSubscription(conversationId);
  const { toast } = useToast();

  // Main setup effect
  useEffect(() => {
    const setupConversation = async () => {
      if (!character?.id || !scenario?.id) {
        console.log('Missing character or scenario ID');
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('native_language, target_language')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        if (!profile?.native_language || !profile?.target_language) {
          throw new Error('Language preferences not set');
        }

        const { data: languages, error: languagesError } = await supabase
          .from('languages')
          .select('id, code')
          .in('code', [profile.native_language, profile.target_language]);

        if (languagesError || !languages || languages.length !== 2) {
          console.error('Error fetching languages:', languagesError);
          throw new Error('Could not find language IDs');
        }

        const nativeLanguageId = languages.find(l => l.code === profile.native_language)?.id;
        const targetLanguageId = languages.find(l => l.code === profile.target_language)?.id;

        if (!nativeLanguageId || !targetLanguageId) {
          throw new Error('Language IDs not found');
        }

        const existingConversation = await fetchExistingConversation(
          user.id,
          character.id,
          scenario.id
        );

        let newConversationId: string;

        if (existingConversation) {
          console.log('Found existing conversation:', existingConversation.id);
          newConversationId = existingConversation.id;
        } else {
          const newConversation = await createNewConversation(
            user.id,
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
              userId: user.id,
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

  return { conversationId, messages };
}