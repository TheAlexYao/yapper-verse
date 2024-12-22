import { useState, useEffect } from "react";
import { ChatMessagesSection } from "./ChatMessagesSection";
import { ChatBottomSection } from "./ChatBottomSection";
import { PronunciationScoreModal } from "./PronunciationScoreModal";
import { useTTSHandler } from "./hooks/useTTSHandler";
import type { Message } from "@/hooks/useConversation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { setupMessageSubscription } from "./hooks/conversation/useMessageSubscription";

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
  const [localMessages, setLocalMessages] = useState<Message[]>(initialMessages);

  // Fetch messages using React Query with optimized caching
  const { data: messages = localMessages } = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) {
        console.log('No conversation ID provided');
        return localMessages;
      }
      
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

      console.log('Fetched messages from database:', messages);

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

        // Only generate TTS if the message has no audio URLs and is not a user message
        if (!msg.audio_url && !msg.reference_audio_url && !msg.is_user) {
          generateTTSForMessage(message);
        }

        return message;
      });

      setLocalMessages(formattedMessages);
      return formattedMessages;
    },
    initialData: localMessages,
    enabled: !!conversationId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    refetchOnMount: false // Prevent refetch on component mount
  });

  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up message subscription for conversation:', conversationId);
    
    const subscription = setupMessageSubscription(conversationId, (newMessages) => {
      console.log('Received new messages from subscription:', newMessages);
      setLocalMessages(prevMessages => {
        const updatedMessages = [...prevMessages, ...newMessages];
        queryClient.setQueryData(['chat-messages', conversationId], updatedMessages);
        return updatedMessages;
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, queryClient]);

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
        messages={messages || []}
        onPlayAudio={handlePlayTTS}
        onShowScore={setSelectedMessageForScore}
      />

      <ChatBottomSection 
        messages={messages || []}
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