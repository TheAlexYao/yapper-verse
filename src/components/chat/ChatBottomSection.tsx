import { ChatMetricsContainer } from "./ChatMetricsContainer";
import { ChatResponseHandler } from "./ChatResponseHandler";
import type { Message } from "@/hooks/useConversation";

interface ChatBottomSectionProps {
  messages: Message[];
  conversationId: string;
  onMessageSend: (message: Message) => void;
}

export function ChatBottomSection({ messages, conversationId, onMessageSend }: ChatBottomSectionProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm">
      <div className="container max-w-3xl mx-auto px-4">
        <ChatMetricsContainer 
          messages={messages} 
          conversationId={conversationId} 
        />
        
        <ChatResponseHandler
          onMessageSend={onMessageSend}
          conversationId={conversationId}
        />
      </div>
    </div>
  );
}