import { ChatMessages } from "./ChatMessages";
import { ChatMetricsContainer } from "./ChatMetricsContainer";
import { ChatResponseHandler } from "./ChatResponseHandler";
import type { Message } from "@/hooks/useConversation";

interface ChatContainerProps {
  messages: Message[];
  onMessageSend: (message: Message) => void;
  onPlayTTS: (text: string) => void;
  conversationId: string;
}

export function ChatContainer({ 
  messages, 
  onMessageSend, 
  onPlayTTS, 
  conversationId 
}: ChatContainerProps) {
  return (
    <>
      <div className="flex-1 relative">
        <ChatMessages 
          messages={messages.map(msg => ({
            id: msg.id,
            conversation_id: msg.conversation_id,
            content: msg.text,
            translation: msg.translation,
            transliteration: msg.transliteration,
            is_user: msg.isUser,
            pronunciation_score: msg.pronunciation_score,
            pronunciation_data: msg.pronunciation_data,
            audio_url: msg.audio_url,
            reference_audio_url: msg.reference_audio_url,
          }))} 
          onPlayAudio={onPlayTTS}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm">
        <div className="container max-w-2xl mx-auto px-4">
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
    </>
  );
}