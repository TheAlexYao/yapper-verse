import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useConversationSetup } from "@/components/chat/hooks/useConversationSetup";
import { useMessageHandling } from "@/components/chat/hooks/useMessageHandling";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useConversation";

export default function GuidedChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scenario, character } = location.state || {};
  const user = useUser();
  const { toast } = useToast();
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  const { conversationId, messages } = useConversationSetup(character, scenario);
  const { handleMessageSend } = useMessageHandling(conversationId);

  const handleMessageUpdate = async (message: Message) => {
    console.log('Handling message update in GuidedChat:', message);
    try {
      await handleMessageSend(message);
    } catch (error) {
      console.error('Error handling message update:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
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
        onMessageSend={handleMessageUpdate}
        onPlayTTS={handlePlayTTS}
        conversationId={conversationId!}
      />
    </div>
  );
}