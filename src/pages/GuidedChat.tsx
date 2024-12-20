import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useConversation } from "@/hooks/useConversation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@supabase/auth-helpers-react";
import type { Message } from "@/hooks/useConversation";

export default function GuidedChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scenario, character } = location.state || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string>("/dummy-tts.mp3");
  const auth = useAuth();
  
  const { character: characterData, createConversation } = useConversation(character?.id);

  useEffect(() => {
    const initializeConversation = async () => {
      if (!auth.user?.id || !character?.id || !scenario?.id) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('native_language, target_language')
        .eq('id', auth.user.id)
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
  }, [auth.user?.id, character?.id, scenario?.id]);

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
        setMessages(prev => [...prev, payload.new as Message]);
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
      id: Date.now().toString(),
      conversation_id: conversationId!,
      content: "Excellent! Je vous prépare votre café tout de suite.",
      translation: "Excellent! I'll prepare your coffee right away.",
      transliteration: "eks-say-LAHN! zhuh voo pray-PAHR vot-ruh kah-FAY too duh SWEET.",
      is_user: false,
    };
    
    setMessages(prev => [...prev, aiResponse]);
  };

  const handlePlayTTS = () => {
    const audio = new Audio(ttsAudioUrl);
    audio.play();
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