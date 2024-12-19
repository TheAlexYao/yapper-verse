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

  // Call scrollToBottom whenever messages change
  useEffect(() => {
    console.log('Messages changed, length:', messages.length);
    
    // Add a small delay to ensure the DOM has updated
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100); // Increased timeout slightly to ensure DOM updates

    return () => clearTimeout(timeoutId);
  }, [messages]); // Re-run effect when messages array changes

  return (
    <ScrollArea 
      className="absolute inset-0" 
      viewportRef={viewportRef}
    >
      <div className="container max-w-2xl mx-auto px-4 pt-16 pb-[calc(2rem+180px)]">
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