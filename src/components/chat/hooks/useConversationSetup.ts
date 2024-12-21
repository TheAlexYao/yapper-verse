import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useConversation";

export function useConversationSetup(character: any, scenario: any) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const user = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const initializeConversation = async () => {
      if (!user?.id || !character?.id || !scenario?.id) return;

      try {
        // Get user's language preferences
        const { data: profile } = await supabase
          .from('profiles')
          .select('native_language, target_language')
          .eq('id', user.id)
          .single();

        if (!profile?.native_language || !profile?.target_language) {
          throw new Error('Language preferences not set');
        }

        // Get language UUIDs
        const { data: languages, error: languagesError } = await supabase
          .from('languages')
          .select('id, code')
          .in('code', [profile.native_language, profile.target_language]);

        if (languagesError) throw languagesError;
        if (!languages || languages.length !== 2) {
          throw new Error('Could not find language information');
        }

        const nativeLanguage = languages.find(l => l.code === profile.native_language);
        const targetLanguage = languages.find(l => l.code === profile.target_language);

        if (!nativeLanguage || !targetLanguage) {
          throw new Error('Language configuration error');
        }

        // Create conversation
        const { data: conversation, error: conversationError } = await supabase
          .from('guided_conversations')
          .insert({
            user_id: user.id,
            character_id: character.id,
            scenario_id: scenario.id,
            native_language_id: nativeLanguage.id,
            target_language_id: targetLanguage.id,
            status: 'active'
          })
          .select()
          .single();

        if (conversationError) throw conversationError;

        setConversationId(conversation.id);

        // Generate initial response
        await supabase.functions.invoke('generate-chat-response', {
          body: {
            conversationId: conversation.id,
            userId: user.id,
            lastMessageContent: null // Indicates this is the initial message
          },
        });
      } catch (error) {
        console.error('Error initializing conversation:', error);
        toast({
          title: "Error",
          description: "Failed to start conversation. Please check your language settings.",
          variant: "destructive",
        });
      }
    };

    initializeConversation();
  }, [user?.id, character?.id, scenario?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const subscription = supabase
      .channel('guided_conversation_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'guided_conversation_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMessage: Message = {
          id: payload.new.id,
          conversation_id: payload.new.conversation_id,
          text: payload.new.content,
          translation: payload.new.translation,
          transliteration: payload.new.transliteration,
          isUser: payload.new.is_user,
          pronunciation_score: payload.new.pronunciation_score,
          pronunciation_data: payload.new.pronunciation_data,
          audio_url: payload.new.audio_url,
        };
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  return { conversationId, messages, setMessages };
}