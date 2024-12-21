import { useState, useEffect, useRef } from "react";
import { ChatMessagesSection } from "./ChatMessagesSection";
import { ChatBottomSection } from "./ChatBottomSection";
import { useTTS } from "./hooks/useTTS";
import { PronunciationScoreModal } from "./PronunciationScoreModal";
import type { Message } from "@/hooks/useConversation";
import { supabase } from "@/integrations/supabase/client";

interface ChatContainerProps {
  messages: Message[];
  onMessageSend: (message: Message) => void;
  onPlayTTS: (text: string) => void;
  conversationId: string;
}

export function ChatContainer({ 
  messages, 
  onMessageSend, 
  onPlayTTS, 
  conversationId 
}: ChatContainerProps) {
  const { generateTTS } = useTTS();
  const [selectedMessageForScore, setSelectedMessageForScore] = useState<Message | null>(null);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const channelRef = useRef<any>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);

  // Initialize messages and set up real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up message subscription for conversation:', conversationId);
    
    // Clean up existing subscription if any
    if (channelRef.current) {
      console.log('Cleaning up existing subscription');
      channelRef.current.unsubscribe();
    }

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
          console.log('Received new message:', payload);
          const newMessage = payload.new;
          
          // Format the message to match our Message type
          const formattedMessage: Message = {
            id: newMessage.id,
            conversation_id: newMessage.conversation_id,
            text: newMessage.content,
            translation: newMessage.translation,
            transliteration: newMessage.transliteration,
            pronunciation_score: newMessage.pronunciation_score,
            pronunciation_data: newMessage.pronunciation_data,
            audio_url: newMessage.audio_url,
            reference_audio_url: newMessage.reference_audio_url,
            isUser: newMessage.is_user
          };

          setLocalMessages(prevMessages => {
            // Check if message already exists
            const exists = prevMessages.some(msg => msg.id === formattedMessage.id);
            if (exists) {
              console.log('Message already exists, skipping:', formattedMessage.id);
              return prevMessages;
            }
            console.log('Adding new message to state:', formattedMessage);
            return [...prevMessages, formattedMessage];
          });

          // Generate TTS for new AI messages
          if (!formattedMessage.isUser && !formattedMessage.audio_url) {
            generateTTSForMessage(formattedMessage);
          }
        }
      );

    // Store channel reference
    channelRef.current = channel;

    // Subscribe to channel
    channel.subscribe((status: string) => {
      console.log('Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to conversation:', conversationId);
      }
    });

    return () => {
      console.log('Cleaning up message subscription');
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [conversationId]);

  // Update local messages when props messages change
  useEffect(() => {
    console.log('Setting initial messages:', messages);
    setLocalMessages(messages);
  }, [messages]);

  const generateTTSForMessage = async (message: Message) => {
    if (!message.text || isGeneratingTTS) return;
    
    setIsGeneratingTTS(true);
    try {
      console.log('Generating TTS for message:', message.text);
      const audioUrl = await generateTTS(message.text);
      if (audioUrl) {
        setLocalMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, audio_url: audioUrl }
              : msg
          )
        );
        console.log('TTS generated successfully:', audioUrl);
      }
    } catch (error) {
      console.error('Error generating TTS:', error);
    } finally {
      setIsGeneratingTTS(false);
    }
  };

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
        messages={localMessages}
        onPlayAudio={handlePlayTTS}
        onShowScore={setSelectedMessageForScore}
      />

      <ChatBottomSection 
        messages={localMessages}
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