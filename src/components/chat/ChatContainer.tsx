import { useState, useCallback, memo, useEffect } from "react";
import { ChatMessagesSection } from "./ChatMessagesSection";
import { ChatBottomSection } from "./ChatBottomSection";
import { FeedbackModal } from "./FeedbackModal";
import { CompletionModal } from "./CompletionModal";
import { useToast } from "@/hooks/use-toast";
import { useConversationMessages } from "./hooks/useConversationMessages";
import { useConversationCompletion } from "./hooks/useConversationCompletion";
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
  const [completionMetrics, setCompletionMetrics] = useState({ 
    pronunciationScore: 0, 
    stylePoints: 0, 
    sentencesUsed: 0 
  });
  
  const { toast } = useToast();
  const { messages } = useConversationMessages(conversationId);
  const { showModal, setShowModal, getMetrics } = useConversationCompletion(conversationId);

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

  // Handle completion modal
  const handleCloseCompletionModal = useCallback(async () => {
    setShowModal(false);
  }, [setShowModal]);

  // Update metrics when modal shows
  useEffect(() => {
    if (showModal) {
      getMetrics().then(setCompletionMetrics);
    }
  }, [showModal, getMetrics]);

  return (
    <div className="flex flex-col h-screen bg-background pt-16">
      <MemoizedChatMessagesSection 
        messages={messages}
        onPlayAudio={handlePlayTTS}
        onShowScore={handleShowScore}
      />

      <MemoizedChatBottomSection 
        messages={messages}
        conversationId={conversationId}
        onMessageSend={onMessageSend}
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

      <CompletionModal
        isOpen={showModal}
        onClose={handleCloseCompletionModal}
        metrics={completionMetrics}
        conversationId={conversationId}
      />
    </div>
  );
}
