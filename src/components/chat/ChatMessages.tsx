import { MessageBubble } from "./MessageBubble";
import type { Message } from "@/hooks/useConversation";

interface ChatMessagesProps {
  messages: Message[];
  onPlayAudio?: (audioUrl: string) => void;
  onShowScore?: (message: Message) => void;
}

export function ChatMessages({ 
  messages, 
  onPlayAudio, 
  onShowScore
}: ChatMessagesProps) {
  return (
    <div className="flex flex-col gap-4 pb-36 pt-4 px-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isUser={message.isUser}
          onPlayAudio={onPlayAudio}
          onShowScore={onShowScore}
        />
      ))}
    </div>
  );
}