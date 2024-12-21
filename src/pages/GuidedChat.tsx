import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useConversation } from "@/hooks/useConversation";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useConversation";

export default function GuidedChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scenario, character } = location.state || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const user = useUser();
  const { toast } = useToast();
  
  const { character: characterData, createConversation } = useConversation(character?.id);

  // Generate initial response after conversation is created
  useEffect(() => {
    const generateInitialResponse = async () => {
      if (!conversationId || !user?.id) return;

      try {
        const response = await supabase.functions.invoke('generate-chat-response', {
          body: {
            conversationId,
            userId: user.id,
            lastMessageContent: null // Indicates this is the initial message
          },
        });

        if (response.error) {
          console.error('Error generating initial response:', response.error);
          throw response.error;
        }
      } catch (error) {
        console.error('Failed to generate initial response:', error);
        toast({
          title: "Error",
          description: "Failed to start conversation. Please try again.",
          variant: "destructive",
        });
      }
    };

    generateInitialResponse();
  }, [conversationId, user?.id]);

  useEffect(() => {
    const initializeConversation = async () => {
      if (!user?.id || !character?.id || !scenario?.id) return;

      try {
        // First get the user's language preferences
        const { data: profile } = await supabase
          .from('profiles')
          .select('native_language, target_language')
          .eq('id', user.id)
          .single();

        if (!profile?.native_language || !profile?.target_language) {
          throw new Error('Language preferences not set');
        }

        // Then get the UUIDs for these languages
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

        const result = await createConversation.mutateAsync({
          characterId: character.id,
          scenarioId: scenario.id,
          nativeLanguageId: nativeLanguage.id,
          targetLanguageId: targetLanguage.id
        });

        if (result?.id) {
          setConversationId(result.id);
        }
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

  const handleMessageSend = async (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handlePlayTTS = async (text: string) => {
    if (isPlayingTTS) return;

    try {
      setIsPlayingTTS(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', user?.id)
        .single();

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      const response = await fetch('/functions/v1/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          text,
          languageCode: profile.target_language,
          gender: profile.voice_preference || 'female'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const { audioUrl } = await response.json();
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: "Error",
        description: "Failed to play audio",
        variant: "destructive",
      });
    } finally {
      setIsPlayingTTS(false);
    }
  };

  if (!scenario || !character) {
    navigate("/scenarios");
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader
        scenario={scenario}
        character={character}
        onBack={() => navigate("/character", { state: { scenario } })}
      />

      <ChatContainer
        messages={messages}
        onMessageSend={handleMessageSend}
        onPlayTTS={handlePlayTTS}
        conversationId={conversationId!}
      />
    </div>
  );
}
