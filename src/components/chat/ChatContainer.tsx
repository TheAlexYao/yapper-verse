import { useState, useEffect } from "react";
import { ChatMessagesSection } from "./ChatMessagesSection";
import { ChatBottomSection } from "./ChatBottomSection";
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
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);

  useEffect(() => {
    console.log('Messages updated in ChatContainer:', messages);
    const generateAudioForNewMessage = async () => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && !lastMessage.isUser && !lastMessage.tts_audio_url && !isGeneratingTTS) {
        setIsGeneratingTTS(true);
        try {
          console.log('Generating TTS for new AI message:', lastMessage.text);
          const audioUrl = await generateTTS(lastMessage.text);
          if (audioUrl) {
            // Update the message with the audio URL
            lastMessage.tts_audio_url = audioUrl;
            console.log('TTS generated successfully:', audioUrl);
          }
        } catch (error) {
          console.error('Error generating TTS:', error);
        } finally {
          setIsGeneratingTTS(false);
        }
      }
    };

    if (messages.length > 0) {
      generateAudioForNewMessage();
    }
  }, [messages, generateTTS, isGeneratingTTS]);

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
      <ChatMessagesSection 
        messages={messages}
        onPlayAudio={handlePlayTTS}
        onShowScore={setSelectedMessageForScore}
      />

      <ChatBottomSection 
        messages={messages}
        conversationId={conversationId}
        onMessageSend={onMessageSend}
      />

      {selectedMessageForScore && (
        <PronunciationScoreModal
          isOpen={!!selectedMessageForScore}
          onClose={() => setSelectedMessageForScore(null)}
          data={selectedMessageForScore.pronunciation_data || {}}
          userAudioUrl={selectedMessageForScore.audio_url}
          referenceAudioUrl={selectedMessageForScore.tts_audio_url}
        />
      )}
    </div>
  );
}