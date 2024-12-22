import { useState, useEffect } from "react";
import { ChatMessagesSection } from "./ChatMessagesSection";
import { ChatBottomSection } from "./ChatBottomSection";
import { useTTS } from "./hooks/useTTS";
import { PronunciationScoreModal } from "./PronunciationScoreModal";
import type { Message } from "@/hooks/useConversation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const { generateTTS } = useTTS();
  const [selectedMessageForScore, setSelectedMessageForScore] = useState<Message | null>(null);
  const queryClient = useQueryClient();

  // Fetch messages using React Query
  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async () => {
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

      // Format messages
      return messages.map((msg): Message => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        text: msg.content,
        translation: msg.translation,
        transliteration: msg.transliteration,
        pronunciation_score: msg.pronunciation_score,
        pronunciation_data: msg.pronunciation_data,
        audio_url: msg.audio_url,
        isUser: msg.is_user
      }));
    },
    initialData: initialMessages,
    refetchInterval: 3000, // Poll every 3 seconds as backup
  });

  // Handle new message send
  const handleMessageSend = async (message: Message) => {
    try {
      console.log('Sending message:', message);
      
      // Optimistically update UI
      queryClient.setQueryData(['chat-messages', conversationId], (old: Message[] = []) => 
        [...old, message]
      );

      // Send message
      await onMessageSend(message);

      // Trigger immediate refetch to get AI response
      await queryClient.invalidateQueries({
        queryKey: ['chat-messages', conversationId],
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Revert optimistic update on error
      queryClient.invalidateQueries({
        queryKey: ['chat-messages', conversationId],
      });
    }
  };

  // Generate TTS for new AI messages
  useEffect(() => {
    const generateTTSForNewMessages = async () => {
      const messagesNeedingTTS = messages.filter(msg => !msg.isUser && !msg.audio_url);
      
      for (const message of messagesNeedingTTS) {
        console.log('Generating TTS for message:', message.text);
        const audioUrl = await generateTTS(message.text);
        
        if (audioUrl) {
          // Update message with audio URL
          await supabase
            .from('guided_conversation_messages')
            .update({ audio_url: audioUrl })
            .eq('id', message.id);

          // Update local cache
          queryClient.setQueryData(['chat-messages', conversationId], (old: Message[] = []) =>
            old.map(msg =>
              msg.id === message.id ? { ...msg, audio_url: audioUrl } : msg
            )
          );
        }
      }
    };

    generateTTSForNewMessages();
  }, [messages, generateTTS, conversationId, queryClient]);

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
        onMessageSend={handleMessageSend}
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