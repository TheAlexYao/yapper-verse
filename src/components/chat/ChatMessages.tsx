import { MessageBubble } from "./MessageBubble";
import { MessageSkeleton } from "./message/MessageSkeleton";
import type { Message } from "@/hooks/useConversation";

interface ChatMessagesProps {
  messages: Message[];
  onPlayAudio?: (audioUrl: string) => void;
  onShowScore?: (message: Message) => void;
  isProcessing?: boolean;
}

export function ChatMessages({ messages, onPlayAudio, onShowScore, isProcessing }: ChatMessagesProps) {
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
      {isProcessing && <MessageSkeleton isUser />}
    </div>
  );
}