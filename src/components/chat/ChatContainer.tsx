import { useState, useEffect } from "react";
import { ChatMessagesSection } from "./ChatMessagesSection";
import { ChatBottomSection } from "./ChatBottomSection";
import { PronunciationScoreModal } from "./PronunciationScoreModal";
import { useTTSHandler } from "./hooks/useTTSHandler";
import type { Message } from "@/hooks/useConversation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChatContainerProps {
  messages: Message[];
  onMessageSend: (message: Message) => void;
  onPlayTTS: (text: string) => void;
  conversationId: string;
}

export function ChatContainer({ 
  messages: initialMessages, 
  onMessageSend, 
  onPlayTTS, 
  conversationId 
}: ChatContainerProps) {
  const [selectedMessageForScore, setSelectedMessageForScore] = useState<Message | null>(null);
  const { generateTTSForMessage } = useTTSHandler(conversationId);

  // Fetch messages using React Query
  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) {
        console.log('No conversation ID provided');
        return [];
      }
      
      console.log('Fetching messages for conversation:', conversationId);
      const { data: messages, error } = await supabase
        .from('guided_conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      return messages.map((msg): Message => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        text: msg.content,
        translation: msg.translation,
        transliteration: msg.transliteration,
        pronunciation_score: msg.pronunciation_score,
        pronunciation_data: msg.pronunciation_data,
        audio_url: msg.audio_url,
        reference_audio_url: msg.reference_audio_url,
        isUser: msg.is_user
      }));
    },
    initialData: initialMessages,
    enabled: !!conversationId,
    refetchInterval: 3000,
  });

  // Generate TTS for new messages
  useEffect(() => {
    const generateTTSForNewMessages = async () => {
      const messagesNeedingTTS = messages.filter(msg => {
        // For AI messages, check if they need audio_url
        if (!msg.isUser) {
          return !msg.audio_url;
        }
        // For user messages, check if they need reference_audio_url
        return !msg.reference_audio_url;
      });
      
      for (const message of messagesNeedingTTS) {
        await generateTTSForMessage(message);
      }
    };

    generateTTSForNewMessages();
  }, [messages, generateTTSForMessage]);

  const handlePlayTTS = async (audioUrl: string) => {
    if (!audioUrl) {
      console.error('No audio URL provided');
      return;
    }
    
    try {
      // Remove any double encoding that might have occurred
      const cleanUrl = audioUrl.startsWith('http') ? audioUrl : decodeURIComponent(audioUrl);
      console.log('Playing audio from URL:', cleanUrl);
      
      const audio = new Audio(cleanUrl);
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
          referenceAudioUrl={selectedMessageForScore.reference_audio_url}
        />
      )}
    </div>
  );
}