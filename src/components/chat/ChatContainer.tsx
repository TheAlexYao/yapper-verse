import { useState, useCallback } from "react";
import { ChatMessagesSection } from "./ChatMessagesSection";
import { ChatBottomSection } from "./ChatBottomSection";
import { ChatResponseHandler } from "./ChatResponseHandler";
import { PronunciationModal } from "./pronunciation/PronunciationModal";
import { useConversationMessages } from "./hooks/useConversationMessages";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useConversation";

interface ChatContainerProps {
  onMessageSend: (message: Message) => void;
  onPlayTTS: (text: string) => void;
  conversationId: string;
}

export function ChatContainer({ 
  onMessageSend, 
  onPlayTTS, 
  conversationId 
}: ChatContainerProps) {
  const [selectedMessageForScore, setSelectedMessageForScore] = useState<Message | null>(null);
  const { toast } = useToast();
  const { messages } = useConversationMessages(conversationId);
  
  const handlePlayTTS = useCallback((audioUrl: string) => {
    try {
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error playing TTS:', error);
      toast({
        title: "Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleShowScore = useCallback((message: Message) => {
    setSelectedMessageForScore(message);
  }, []);

  const handleCloseScoreModal = useCallback(() => {
    setSelectedMessageForScore(null);
  }, []);

  const handleMessageSend = useCallback(async (message: Message) => {
    try {
      await onMessageSend(message);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [onMessageSend, toast]);

  return (
    <>
      <ChatMessagesSection 
        messages={messages}
        onPlayAudio={handlePlayTTS}
        onShowScore={handleShowScore}
      />

      <ChatBottomSection
        messages={messages}
        conversationId={conversationId}
        onMessageSend={handleMessageSend}
      />

      <ChatResponseHandler
        onMessageSend={handleMessageSend}
        conversationId={conversationId}
      />

      {selectedMessageForScore && (
        <PronunciationModal
          isOpen={!!selectedMessageForScore}
          onClose={handleCloseScoreModal}
          response={{
            text: selectedMessageForScore.text,
            translation: selectedMessageForScore.translation || '',
            audio_url: selectedMessageForScore.audio_url,
            pronunciationData: selectedMessageForScore.pronunciation_data
          }}
          isProcessing={false}
          onSubmit={() => {}}
        />
      )}
    </>
  );
}