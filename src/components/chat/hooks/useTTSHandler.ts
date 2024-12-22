import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTTS } from './useTTS';
import type { Message } from '@/hooks/useConversation';

// Track TTS generation status across component instances
const ttsInProgressIds = new Set<string>();

export function useTTSHandler(conversationId: string) {
  const { generateTTS } = useTTS();
  const queryClient = useQueryClient();
  const [processingTTS, setProcessingTTS] = useState<Set<string>>(new Set());

  const generateTTSForMessage = useCallback(async (message: Message) => {
    // Skip if already processing
    if (ttsInProgressIds.has(message.id)) {
      console.log('Already processing TTS for message:', message.id);
      return;
    }

    // For AI messages: generate and store as audio_url
    // For user messages: generate and store as reference_audio_url
    const hasRequiredAudio = message.isUser ? 
      message.reference_audio_url : 
      message.audio_url;

    // Skip if message already has the required audio URL
    if (!message.text || hasRequiredAudio) {
      console.log('Skipping TTS generation:', { 
        hasText: !!message.text, 
        hasRequiredAudio
      });
      return;
    }

    console.log('Generating TTS for message:', message.text);
    ttsInProgressIds.add(message.id);
    setProcessingTTS(prev => new Set(prev).add(message.id));

    try {
      const audioUrl = await generateTTS(message.text);
      console.log('Generated audio URL:', audioUrl);
      
      if (audioUrl) {
        // Update the appropriate audio URL field based on message type
        const updateData = message.isUser ? 
          { reference_audio_url: audioUrl } : 
          { audio_url: audioUrl };

        const { error } = await supabase
          .from('guided_conversation_messages')
          .update(updateData)
          .eq('id', message.id);

        if (error) {
          console.error('Error updating message with audio URL:', error);
          return;
        }

        console.log('Updated message with audio URL:', message.id);

        // Update React Query cache
        queryClient.setQueryData(['chat-messages', conversationId], (old: Message[] = []) =>
          old.map(msg =>
            msg.id === message.id ? { ...msg, ...updateData } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error generating TTS:', error);
    } finally {
      ttsInProgressIds.delete(message.id);
      setProcessingTTS(prev => {
        const newSet = new Set(prev);
        newSet.delete(message.id);
        return newSet;
      });
    }
  }, [generateTTS, conversationId, queryClient]);

  return {
    generateTTSForMessage,
    processingTTS
  };
}