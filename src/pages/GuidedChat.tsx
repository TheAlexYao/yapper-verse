import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useToast } from "@/hooks/use-toast";
import { useMessageHandling } from "@/components/chat/hooks/useMessageHandling";
import { useConversationSetup } from "@/components/chat/hooks/useConversationSetup";
import { useTTS } from "@/components/chat/hooks/useTTS";
import type { Message } from "@/hooks/useConversation";

export default function GuidedChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scenario, character } = location.state || {};
  const { toast } = useToast();
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const { generateTTS } = useTTS();

  const { conversationId } = useConversationSetup(character, scenario);
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
    if (isPlayingTTS) {
      console.log('TTS already playing, skipping');
      return;
    }

    try {
      setIsPlayingTTS(true);
      const audioUrl = await generateTTS(text);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('Error playing TTS:', error);
      toast({
        title: "Error",
        description: "Failed to play audio. Please try again.",
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

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
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
        conversationId={conversationId}
      />
    </div>
  );
}