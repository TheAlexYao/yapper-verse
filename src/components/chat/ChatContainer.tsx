import { useState, useCallback, memo } from "react";
import { ChatMessagesSection } from "./ChatMessagesSection";
import { ChatBottomSection } from "./ChatBottomSection";
import { FeedbackModal } from "./FeedbackModal";
import { useToast } from "@/hooks/use-toast";
import { useConversationMessages } from "./hooks/useConversationMessages";
import type { Message } from "@/hooks/useConversation";

interface ChatContainerProps {
  onMessageSend: (message: Message) => void;
  onPlayTTS: (text: string) => void;
  conversationId: string;
}

const MemoizedChatMessagesSection = memo(ChatMessagesSection);
const MemoizedChatBottomSection = memo(ChatBottomSection);

export function ChatContainer({ 
  onMessageSend, 
  onPlayTTS, 
  conversationId 
}: ChatContainerProps) {
  const [selectedMessageForScore, setSelectedMessageForScore] = useState<Message | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAIResponse, setIsGeneratingAIResponse] = useState(false);
  const { toast } = useToast();
  const { messages } = useConversationMessages(conversationId);
  
  const handlePlayTTS = useCallback(async (audioUrl: string) => {
    if (!audioUrl) {
      console.error('No audio URL provided');
      toast({
        title: "Error",
        description: "No audio available to play.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const cleanUrl = audioUrl.startsWith('http') ? audioUrl : decodeURIComponent(audioUrl);
      console.log('Playing audio from URL:', cleanUrl);
      
      const audio = new Audio(cleanUrl);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
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

  const handleMessageSend = useCallback(async (message: Message) => {
    setIsProcessing(true);
    setIsGeneratingAIResponse(true);
    try {
      await onMessageSend(message);
    } finally {
      // We set isProcessing to false after a short delay to ensure the skeleton is visible
      setTimeout(() => setIsProcessing(false), 500);
      // AI response generation is handled by the subscription in useConversationMessages
      // We'll set this to false when we receive the AI response
      setTimeout(() => setIsGeneratingAIResponse(false), 3000);
    }
  }, [onMessageSend]);

  return (
    <div className="flex flex-col h-screen bg-background pt-16">
      <MemoizedChatMessagesSection 
        messages={messages}
        onPlayAudio={handlePlayTTS}
        onShowScore={handleShowScore}
        isProcessing={isProcessing}
        isGeneratingAIResponse={isGeneratingAIResponse}
      />

      <MemoizedChatBottomSection 
        messages={messages}
        conversationId={conversationId}
        onMessageSend={handleMessageSend}
      />

      {selectedMessageForScore && (
        <FeedbackModal
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