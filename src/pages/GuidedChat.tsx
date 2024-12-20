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

  useEffect(() => {
    const initializeConversation = async () => {
      if (!user?.id || !character?.id || !scenario?.id) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('native_language, target_language')
        .eq('id', user.id)
        .single();

      if (!profile?.native_language || !profile?.target_language) return;

      const result = await createConversation.mutateAsync({
        characterId: character.id,
        scenarioId: scenario.id,
        nativeLanguageId: profile.native_language,
        targetLanguageId: profile.target_language
      });

      if (result?.id) {
        setConversationId(result.id);
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

  const handleMessageSend = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Simulate AI response (will be replaced with real API call)
    const aiResponse: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId!,
      text: "Excellent! Je vous prépare votre café tout de suite.",
      translation: "Excellent! I'll prepare your coffee right away.",
      transliteration: "eks-say-LAHN! zhuh voo pray-PAHR vot-ruh kah-FAY too duh SWEET.",
      isUser: false,
    };
    
    setMessages(prev => [...prev, aiResponse]);
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

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          languageCode: profile.target_language,
          voiceGender: profile.voice_preference || 'female',
          speed: 'normal'
        }
      });

      if (error) {
        throw error;
      }

      const audio = new Audio(data.audioUrl);
      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: "Error", 
        description: error.message || "Failed to play audio",
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