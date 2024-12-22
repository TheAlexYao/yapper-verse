import { useState, useEffect, useRef } from "react";
import { ChatMessagesSection } from "./ChatMessagesSection";
import { ChatBottomSection } from "./ChatBottomSection";
import { PronunciationScoreModal } from "./PronunciationScoreModal";
import { useTTSHandler } from "./hooks/useTTSHandler";
import type { Message } from "@/hooks/useConversation";
import { useQuery } from "@tanstack/react-query";
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
  const channelRef = useRef<any>(null);
  const isMountedRef = useRef(false);

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

      // Process messages and check for TTS needs
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

        // Check if message needs TTS
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

  // Handle component mounting/unmounting
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Set up real-time subscription with cleanup
  useEffect(() => {
    if (!conversationId || !isMountedRef.current) return;

    // Clean up existing subscription if any
    if (channelRef.current) {
      console.log('Cleaning up existing subscription');
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    console.log('Setting up subscription for conversation:', conversationId);
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guided_conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (!isMountedRef.current) return;
          
          console.log('New message received:', payload);
          const msg = payload.new;
          
          // Check if message needs TTS
          if (msg && !msg.audio_url && !msg.reference_audio_url) {
            console.log('Generating TTS for new message:', msg.id);
            generateTTSForMessage({
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
            });
          }
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return;
        console.log('Subscription status:', status);
      });

    // Store channel reference
    channelRef.current = channel;

    // Cleanup subscription on unmount or conversationId change
    return () => {
      console.log('Cleaning up subscription for conversation:', conversationId);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [conversationId, generateTTSForMessage]);

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