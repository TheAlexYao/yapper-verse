import { useEffect, useState, useRef } from "react";
import { ChatMessages } from "./ChatMessages";
import { ChatMetricsContainer } from "./ChatMetricsContainer";
import { ChatResponseHandler } from "./ChatResponseHandler";
import { useTTS } from "./hooks/useTTS";
import { PronunciationScoreModal } from "./PronunciationScoreModal";
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
  const { generateTTS } = useTTS();
  const [selectedMessageForScore, setSelectedMessageForScore] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const generateAudioForNewMessage = async () => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && !lastMessage.isUser && !lastMessage.audio_url) {
        const audioUrl = await generateTTS(lastMessage.text);
        if (audioUrl) {
          lastMessage.audio_url = audioUrl;
        }
      }
    };

    if (messages.length > 0) {
      generateAudioForNewMessage();
    }
  }, [messages, generateTTS]);

  const handlePlayTTS = async (audioUrl: string) => {
    if (!audioUrl) {
      console.error('No audio URL provided');
      return;
    }
    
    try {
      const audio = new Audio(decodeURIComponent(audioUrl));
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background pt-16">
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="container max-w-3xl mx-auto px-4">
          <ChatMessages 
            messages={messages} 
            onPlayAudio={handlePlayTTS}
            onShowScore={setSelectedMessageForScore}
          />
          <div ref={messagesEndRef} />
        </div>
      </div>

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

      {selectedMessageForScore && (
        <PronunciationScoreModal
          isOpen={!!selectedMessageForScore}
          onClose={() => setSelectedMessageForScore(null)}
          data={selectedMessageForScore.pronunciation_data || {}}
          userAudioUrl={selectedMessageForScore.audio_url}
          referenceAudioUrl={selectedMessageForScore.reference_audio_url}
        />
      )}
    </div>
  );
}