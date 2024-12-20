import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useConversation } from "@/hooks/useConversation";
import type { Message } from "@/hooks/useConversation";

export default function GuidedChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scenario, character } = location.state || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string>("/dummy-tts.mp3");
  
  const { character: characterData, createConversation } = useConversation(character?.id);

  const handleMessageSend = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Simulate AI response (will be replaced with real API call)
    const aiResponse: Message = {
      id: Date.now().toString(),
      text: "Excellent! Je vous prépare votre café tout de suite.",
      translation: "Excellent! I'll prepare your coffee right away.",
      transliteration: "eks-say-LAHN! zhuh voo pray-PAHR vot-ruh kah-FAY too duh SWEET.",
      isUser: false,
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
      />
    </div>
  );
}