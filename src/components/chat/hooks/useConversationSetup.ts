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
      if (!character?.id || !scenario?.id) return;

      try {
        // First get the user's profile to determine languages
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const { data: profile } = await supabase
          .from('profiles')
          .select('native_language, target_language')
          .eq('id', user.id)
          .single();

        if (!profile?.native_language || !profile?.target_language) {
          throw new Error('Language preferences not set');
        }

        // Get language IDs
        const { data: languages } = await supabase
          .from('languages')
          .select('id, code')
          .in('code', [profile.native_language, profile.target_language]);

        if (!languages || languages.length !== 2) {
          throw new Error('Could not find language IDs');
        }

        const nativeLanguageId = languages.find(l => l.code === profile.native_language)?.id;
        const targetLanguageId = languages.find(l => l.code === profile.target_language)?.id;

        if (!nativeLanguageId || !targetLanguageId) {
          throw new Error('Language IDs not found');
        }

        // Create or get existing conversation
        const { data: existingConversation } = await supabase
          .from('guided_conversations')
          .select('id')
          .eq('user_id', user.id)
          .eq('character_id', character.id)
          .eq('scenario_id', scenario.id)
          .eq('status', 'active')
          .single();

        if (existingConversation) {
          console.log('Found existing conversation:', existingConversation.id);
          setConversationId(existingConversation.id);
        } else {
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

          if (conversationError) throw conversationError;
          console.log('Created new conversation:', newConversation.id);
          setConversationId(newConversation.id);
        }
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

  // Subscribe to new messages when conversationId is set
  useEffect(() => {
    if (!conversationId) return;

    // First, fetch existing messages
    const fetchMessages = async () => {
      const { data: existingMessages, error } = await supabase
        .from('guided_conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const formattedMessages: Message[] = existingMessages.map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        text: msg.content,
        translation: msg.translation,
        transliteration: msg.transliteration,
        pronunciation_score: msg.pronunciation_score,
        pronunciation_data: msg.pronunciation_data,
        audio_url: msg.audio_url,
        isUser: msg.is_user
      }));

      console.log('Setting initial messages:', formattedMessages);
      setMessages(formattedMessages);
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
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
          
          setMessages(prevMessages => [...prevMessages, formattedMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  return { conversationId, messages, setMessages };
}