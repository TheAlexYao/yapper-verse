import { useEffect, useRef } from "react";
import { ChatMessages } from "./ChatMessages";
import type { Message } from "@/hooks/useConversation";

interface ChatMessagesSectionProps {
  messages: Message[];
  onPlayAudio: (audioUrl: string) => void;
  onShowScore: (message: Message) => void;
}

export function ChatMessagesSection({ 
  messages, 
  onPlayAudio, 
  onShowScore 
}: ChatMessagesSectionProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <div className="container max-w-3xl mx-auto px-4">
        <ChatMessages 
          messages={messages} 
          onPlayAudio={onPlayAudio}
          onShowScore={onShowScore}
        />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}