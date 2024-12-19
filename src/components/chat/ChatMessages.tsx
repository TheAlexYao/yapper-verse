import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/MessageBubble";

interface Message {
  id: string;
  text: string;
  translation?: string;
  transliteration?: string;
  pronunciationScore?: number;
  isUser: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
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
        {messages.map((message: Message, index) => {
          const isLastMessage = index === messages.length - 1;
          return (
            <div
              key={message.id}
              ref={isLastMessage ? lastMessageRef : null}
            >
              <MessageBubble
                message={message}
                isUser={message.isUser}
                onPlayAudio={!message.isUser ? () => {} : undefined}
              />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}