import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { GuidedMessage } from "@/types/conversation";

// Transform GuidedMessage to Message format
const transformMessage = (message: GuidedMessage) => ({
  ...message,
  text: message.content,
  isUser: message.is_user,
});

interface ChatMessagesProps {
  messages: GuidedMessage[];
  onPlayAudio: () => void;
}

export function ChatMessages({ messages, onPlayAudio }: ChatMessagesProps) {
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lastMessageRef.current && scrollAreaRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        const scrollArea = scrollAreaRef.current;
        const lastMessage = lastMessageRef.current;
        
        if (scrollArea && lastMessage) {
          lastMessage.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      });
    }
  }, [messages]);

  return (
    <ScrollArea 
      className="h-[calc(100vh-13rem)] relative" 
      ref={scrollAreaRef}
    >
      <div className="container max-w-2xl mx-auto px-4 pt-16">
        {messages.map((message: GuidedMessage, index) => {
          const isLastMessage = index === messages.length - 1;
          const transformedMessage = transformMessage(message);
          return (
            <div
              key={message.id}
              ref={isLastMessage ? lastMessageRef : null}
            >
              <MessageBubble
                message={transformedMessage}
                isUser={message.is_user}
                onPlayAudio={!message.is_user ? onPlayAudio : undefined}
              />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}