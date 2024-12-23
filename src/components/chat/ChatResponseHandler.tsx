import { useState, useEffect } from "react";
import { RecommendedResponses } from "./RecommendedResponses";
import { PronunciationModal } from "./pronunciation/PronunciationModal";
import type { Message } from "@/hooks/useConversation";
import { usePronunciationHandler } from "./hooks/usePronunciationHandler";
import { useTTS } from "./hooks/useTTS";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatResponseHandlerProps {
  onMessageSend: (message: Message) => void;
  conversationId: string;
}

export function ChatResponseHandler({ onMessageSend, conversationId }: ChatResponseHandlerProps) {
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // BUG: This state might not update immediately when a new AI message arrives
  // because the subscription might miss messages that arrive before it's set up
  const [lastAiMessageId, setLastAiMessageId] = useState<string | null>(null);
  
  const { generateTTS, isGeneratingTTS } = useTTS();
  const user = useUser();
  const { toast } = useToast();

  // Load initial AI message ID
  useEffect(() => {
    if (!conversationId) return;
    
    const loadLastAiMessage = async () => {
      // BUG: This initial load might race with new messages arriving
      // We should consider using a more robust way to track message order
      const { data } = await supabase
        .from('guided_conversation_messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('is_user', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        console.log('Setting initial last AI message ID:', data.id);
        setLastAiMessageId(data.id);
      }
    };

    loadLastAiMessage();
  }, [conversationId]);

  // BUG: The useQuery hook might not refresh immediately when lastAiMessageId changes
  // due to React's batching of state updates
  const { data: responses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ['responses', conversationId, user?.id, lastAiMessageId],
    queryFn: async () => {
      if (!user?.id || !conversationId) return [];

      try {
        console.log('Fetching responses after AI message:', lastAiMessageId);
        const { data, error } = await supabase.functions.invoke('generate-responses', {
          body: {
            conversationId,
            userId: user.id,
            lastMessageId: lastAiMessageId
          },
        });

        if (error) throw error;
        return data.responses || [];
      } catch (error) {
        console.error('Error fetching responses:', error);
        toast({
          title: "Error",
          description: "Failed to generate responses. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!conversationId && !!user?.id,
    staleTime: 0, // Always refetch when queryKey changes
    gcTime: 0, // Don't cache responses
  });

  // Listen for new AI messages
  useEffect(() => {
    if (!conversationId) return;

    // BUG: The subscription might miss messages that arrive during setup
    // We should consider using a more robust message tracking mechanism
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guided_conversation_messages',
          filter: `conversation_id=eq.${conversationId} AND is_user=eq.false`
        },
        (payload) => {
          console.log('New AI message detected:', payload.new.id);
          // BUG: This state update might not immediately trigger a response refresh
          // due to React's state batching and the async nature of the subscription
          setLastAiMessageId(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up message subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const { handlePronunciationComplete } = usePronunciationHandler({ 
    conversationId, 
    onMessageSend: async (message: Message) => {
      setShowPronunciationModal(false);
      setIsProcessing(false);
      setSelectedResponse(null);
      await onMessageSend(message);
    },
    onComplete: () => {
      setShowPronunciationModal(false);
      setIsProcessing(false);
      setSelectedResponse(null);
    },
    selectedResponse: selectedResponse || { text: '', translation: '' }
  });

  const handleResponseSelect = async (response: any) => {
    if (isGeneratingTTS) {
      toast({
        title: "Please wait",
        description: "Audio is still being generated",
        variant: "default",
      });
      return;
    }
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', user?.id)
        .single();

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      console.log('Generating reference audio for:', response.text);
      const normalAudioUrl = await generateTTS(
        response.text, 
        profile.voice_preference || 'female',
        'normal'
      );
      
      if (!normalAudioUrl) {
        throw new Error('Failed to generate reference audio');
      }

      setSelectedResponse({ 
        ...response, 
        audio_url: normalAudioUrl,
        languageCode: profile.target_language
      });
      setShowPronunciationModal(true);
    } catch (error) {
      console.error('Error preparing pronunciation practice:', error);
      toast({
        title: "Error",
        description: "Failed to prepare pronunciation practice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePronunciationSubmit = async (score: number, audioBlob?: Blob) => {
    if (!selectedResponse) {
      toast({
        title: "Error",
        description: "No response selected. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Starting pronunciation submission with score:', score);
      await handlePronunciationComplete(score, audioBlob);
      console.log('Pronunciation submission completed successfully');
    } catch (error) {
      console.error('Error handling pronunciation:', error);
      toast({
        title: "Error",
        description: "Failed to process pronunciation. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <>
      <RecommendedResponses
        responses={responses}
        onSelectResponse={handleResponseSelect}
        isLoading={isLoadingResponses || isGeneratingTTS}
      />

      {selectedResponse && showPronunciationModal && (
        <PronunciationModal
          isOpen={showPronunciationModal}
          onClose={() => {
            setShowPronunciationModal(false);
            setIsProcessing(false);
            setSelectedResponse(null);
          }}
          response={selectedResponse}
          onSubmit={handlePronunciationSubmit}
          isProcessing={isProcessing}
        />
      )}
    </>
  );
}