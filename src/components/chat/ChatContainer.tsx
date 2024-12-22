import { useState, useCallback } from "react";
import { ChatMessagesSection } from "./ChatMessagesSection";
import { ChatBottomSection } from "./ChatBottomSection";
import { PronunciationScoreModal } from "./PronunciationScoreModal";
import { useTTSHandler } from "./hooks/useTTSHandler";
import { useMessageSubscription } from "./hooks/useMessageSubscription";
import type { Message } from "@/hooks/useConversation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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
        toast({
          title: "Error",
          description: "Failed to fetch messages. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      const formattedMessages = messages.map((msg): Message => {
        const message = {
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
        };

        if (!msg.audio_url && !msg.reference_audio_url) {
          console.log('Message needs TTS generation:', msg.id);
          generateTTSForMessage(message);
        }

        return message;
      });

      console.log('Setting initial messages:', formattedMessages);
      return formattedMessages;
    },
    initialData: initialMessages,
    enabled: !!conversationId,
  });

  const handleNewMessage = useCallback((newMessage: Message) => {
    queryClient.setQueryData(['chat-messages', conversationId], (oldData: Message[] = []) => {
      // Check if message already exists
      const exists = oldData.some(msg => msg.id === newMessage.id);
      if (exists) {
        console.log('Message already exists, skipping:', newMessage.id);
        return oldData;
      }
      
      // Check if message needs TTS
      if (!newMessage.audio_url && !newMessage.reference_audio_url) {
        console.log('New message needs TTS generation:', newMessage.id);
        generateTTSForMessage(newMessage);
      }
      
      return [...oldData, newMessage];
    });
  }, [generateTTSForMessage, queryClient, conversationId]);

  // Set up stable subscription
  useMessageSubscription(conversationId, handleNewMessage);

  const handlePlayTTS = async (audioUrl: string) => {
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