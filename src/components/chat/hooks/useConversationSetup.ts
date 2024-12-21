import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useConversation";

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
        // First get the user's profile to determine languages
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user');
          throw new Error('No authenticated user');
        }

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
          console.error('Language preferences not set');
          throw new Error('Language preferences not set');
        }

        // Get language IDs
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
          console.error('Language IDs not found');
          throw new Error('Language IDs not found');
        }

        // Check for existing active conversation, ordered by creation date
        const { data: existingConversation, error: existingError } = await supabase
          .from('guided_conversations')
          .select('id')
          .eq('user_id', user.id)
          .eq('character_id', character.id)
          .eq('scenario_id', scenario.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (existingError) {
          console.error('Error checking existing conversation:', existingError);
          throw existingError;
        }

        let newConversationId: string;

        if (existingConversation) {
          console.log('Found existing conversation:', existingConversation.id);
          newConversationId = existingConversation.id;
        } else {
          // Create new conversation
          const { data: newConversation, error: conversationError } = await supabase
            .from('guided_conversations')
            .insert({
              user_id: user.id,
              character_id: character.id,
              scenario_id: scenario.id,
              native_language_id: nativeLanguageId,
              target_language_id: targetLanguageId,
              status: 'active',
              metrics: {
                pronunciationScore: 0,
                stylePoints: 0,
                sentencesUsed: 0,
                sentenceLimit: 10
              }
            })
            .select()
            .single();

          if (conversationError || !newConversation) {
            console.error('Error creating conversation:', conversationError);
            throw conversationError;
          }

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

        // Fetch initial messages
        const { data: existingMessages, error: messagesError } = await supabase
          .from('guided_conversation_messages')
          .select('*')
          .eq('conversation_id', newConversationId)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          throw messagesError;
        }

        const formattedMessages: Message[] = existingMessages?.map(msg => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          text: msg.content,
          translation: msg.translation,
          transliteration: msg.transliteration,
          pronunciation_score: msg.pronunciation_score,
          pronunciation_data: msg.pronunciation_data,
          audio_url: msg.audio_url,
          isUser: msg.is_user
        })) || [];

        console.log('Setting initial messages:', formattedMessages);
        setMessages(formattedMessages);

        // Subscribe to new messages
        const channel = supabase
          .channel(`conversation:${newConversationId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'guided_conversation_messages',
              filter: `conversation_id=eq.${newConversationId}`
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
              
              setMessages(prevMessages => [...prevMessages, formattedMessage]);
            }
          )
          .subscribe();

        return () => {
          channel.unsubscribe();
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