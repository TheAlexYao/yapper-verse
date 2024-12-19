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
        console.log('Scrolling to bottom, current height:', viewport.scrollHeight);
        viewport.scrollTop = viewport.scrollHeight;
      } else {
        console.log('Viewport element not found');
      }
    } else {
      console.log('ViewportRef not set');
    }
  };

  useEffect(() => {
    console.log('Messages changed, length:', messages.length);
    
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  return (
    <ScrollArea 
      className="h-full relative" 
      viewportRef={viewportRef}
    >
      <div className="container max-w-2xl mx-auto px-4 py-4">
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