import { useEffect, useState } from "react";
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
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

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
          onPlayAudio={handlePlayTTS}
          onShowScore={setSelectedMessageForScore}
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

      {selectedMessageForScore && (
        <PronunciationScoreModal
          isOpen={!!selectedMessageForScore}
          onClose={() => setSelectedMessageForScore(null)}
          data={selectedMessageForScore.pronunciation_data || {}}
          userAudioUrl={selectedMessageForScore.audio_url}
          referenceAudioUrl={selectedMessageForScore.reference_audio_url}
        />
      )}
    </>
  );
}