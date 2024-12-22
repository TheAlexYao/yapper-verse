import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTTS } from './useTTS';
import { useTTSState } from './useTTSState';
import type { Message } from '@/hooks/useConversation';
import { useToast } from '@/hooks/use-toast';

export function useTTSHandler(conversationId: string) {
  const { generateTTS } = useTTS();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isGeneratingTTS, startTTSGeneration, finishTTSGeneration } = useTTSState();

  const generateTTSForMessage = useCallback(async (message: Message) => {
    // Skip if no text
    if (!message.text) {
      console.log('Skipping TTS generation: no text content');
      return;
    }

    // Check if already has required audio
    const hasRequiredAudio = message.isUser ? 
      message.reference_audio_url : 
      message.audio_url;

    if (hasRequiredAudio) {
      console.log('Skipping TTS generation: audio already exists', {
        messageId: message.id,
        isUser: message.isUser,
        audioUrl: hasRequiredAudio
      });
      return;
    }

    // Skip if already processing
    if (isGeneratingTTS(message.id)) {
      console.log('Already processing TTS for message:', message.id);
      return;
    }

    console.log('Starting TTS generation for message:', {
      messageId: message.id,
      text: message.text,
      isUser: message.isUser
    });
    
    startTTSGeneration(message.id);

    try {
      // Get user's profile to determine voice preference
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .single();

      if (!profile?.target_language) {
        throw new Error('Target language not set');
      }

      const audioUrl = await generateTTS(
        message.text,
        profile.voice_preference || 'female',
        'normal'
      );

      console.log('Generated audio URL:', audioUrl);
      
      if (!audioUrl) {
        throw new Error('Failed to generate audio URL');
      }

      // Update the appropriate audio URL field based on message type
      const updateData = message.isUser ? 
        { reference_audio_url: audioUrl } : 
        { audio_url: audioUrl };

      console.log('Updating message with audio URL:', {
        messageId: message.id,
        updateData
      });

      const { error: updateError } = await supabase
        .from('guided_conversation_messages')
        .update(updateData)
        .eq('id', message.id);

      if (updateError) {
        console.error('Error updating message with audio URL:', updateError);
        throw updateError;
      }

      // Update React Query cache
      queryClient.setQueryData(['chat-messages', conversationId], (old: Message[] = []) =>
        old.map(msg =>
          msg.id === message.id ? { ...msg, ...updateData } : msg
        )
      );

      console.log('Successfully updated message with audio URL');

    } catch (error) {
      console.error('Error generating TTS:', error);
      toast({
        title: "Error",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      finishTTSGeneration(message.id);
    }
  }, [generateTTS, conversationId, queryClient, toast, isGeneratingTTS, startTTSGeneration, finishTTSGeneration]);

  return {
    generateTTSForMessage
  };
}