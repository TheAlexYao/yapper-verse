import { useState, useCallback, memo } from "react";
import { ChatMessagesSection } from "./ChatMessagesSection";
import { ChatBottomSection } from "./ChatBottomSection";
import { FeedbackModal } from "./FeedbackModal";
import { CompletionModal } from "./CompletionModal";
import { useToast } from "@/hooks/use-toast";
import { useConversationMessages } from "./hooks/useConversationMessages";
import { supabase } from "@/integrations/supabase/client";
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
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const { toast } = useToast();
  const { messages } = useConversationMessages(conversationId);
  
  // Track user messages for completion
  const userMessages = messages.filter(m => m.isUser);
  const metrics = {
    pronunciationScore: Math.round(
      userMessages.reduce((acc, msg) => acc + (msg.pronunciation_score || 0), 0) / 
      (userMessages.length || 1)
    ),
    stylePoints: 120, // This should be calculated based on actual metrics
    sentencesUsed: userMessages.length
  };

  // Check for conversation completion
  const isComplete = userMessages.length >= 10;
  
  // Handle completion when sentence limit is reached
  const handleMessageSendWithCompletion = async (message: Message) => {
    await onMessageSend(message);
    
    if (userMessages.length + 1 >= 10) {
      // Update conversation status
      const { error } = await supabase
        .from('guided_conversations')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          metrics: {
            pronunciationScore: metrics.pronunciationScore,
            stylePoints: metrics.stylePoints,
            sentencesUsed: metrics.sentencesUsed,
            sentenceLimit: 10
          }
        })
        .eq('id', conversationId);

      if (error) {
        console.error('Error updating conversation status:', error);
        toast({
          title: "Error",
          description: "Failed to update conversation status.",
          variant: "destructive",
        });
        return;
      }

      setShowCompletionModal(true);
    }
  };

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
        onMessageSend={handleMessageSendWithCompletion}
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
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        metrics={metrics}
        conversationId={conversationId}
      />
    </div>
  );
}