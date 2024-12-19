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
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      const viewport = viewportRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
        console.log('Scrolled to bottom, height:', viewport.scrollHeight);
      }
    }
  };

  useEffect(() => {
    // Scroll immediately for the initial messages
    scrollToBottom();
    
    // And then again after a short delay to ensure all content is rendered
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  return (
    <ScrollArea 
      className="h-full relative" 
      viewportRef={viewportRef}
    >
      <div className="container max-w-2xl mx-auto px-4 pt-16 pb-48">
        {messages.map((message: Message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isUser={message.isUser}
            onPlayAudio={!message.isUser ? () => {} : undefined}
          />
        ))}
      </div>
    </ScrollArea>
  );
}