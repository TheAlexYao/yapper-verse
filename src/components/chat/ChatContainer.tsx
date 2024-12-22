import { useState, useEffect, useCallback } from "react";
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
  const [processingTTS, setProcessingTTS] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

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
        isUser: msg.is_user
      }));
    },
    initialData: initialMessages,
    enabled: !!conversationId,
    refetchInterval: 3000,
  });

  const handleMessageSend = async (message: Message) => {
    try {
      console.log('Sending message:', message);
      
      queryClient.setQueryData(['chat-messages', conversationId], (old: Message[] = []) => 
        [...old, message]
      );

      await onMessageSend(message);

      await queryClient.invalidateQueries({
        queryKey: ['chat-messages', conversationId],
      });
    } catch (error) {
      console.error('Error sending message:', error);
      queryClient.invalidateQueries({
        queryKey: ['chat-messages', conversationId],
      });
    }
  };

  // Generate TTS for new AI messages
  const generateTTSForMessage = useCallback(async (message: Message) => {
    // Skip if already processing
    if (processingTTS.has(message.id)) {
      console.log('Already processing TTS for message:', message.id);
      return;
    }

    // Skip if message already has an audio URL
    if (!message.text || message.isUser || message.audio_url) {
      console.log('Skipping TTS generation:', { 
        hasText: !!message.text, 
        isUser: message.isUser, 
        hasAudio: !!message.audio_url 
      });
      return;
    }

    console.log('Generating TTS for message:', message.text);
    setProcessingTTS(prev => new Set(prev).add(message.id));

    try {
      const audioUrl = await generateTTS(message.text);
      console.log('Generated audio URL:', audioUrl);
      
      if (audioUrl) {
        await supabase
          .from('guided_conversation_messages')
          .update({ audio_url: audioUrl })
          .eq('id', message.id);

        console.log('Updated message with audio URL:', message.id);

        queryClient.setQueryData(['chat-messages', conversationId], (old: Message[] = []) =>
          old.map(msg =>
            msg.id === message.id ? { ...msg, audio_url: audioUrl } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error generating TTS:', error);
    } finally {
      setProcessingTTS(prev => {
        const newSet = new Set(prev);
        newSet.delete(message.id);
        return newSet;
      });
    }
  }, [generateTTS, conversationId, queryClient, processingTTS]);

  useEffect(() => {
    const generateTTSForNewMessages = async () => {
      const messagesNeedingTTS = messages.filter(
        msg => !msg.isUser && !msg.audio_url && !processingTTS.has(msg.id)
      );
      
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