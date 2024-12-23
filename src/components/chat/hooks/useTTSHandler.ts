import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTTS } from './useTTS';
import { useTTSState } from './useTTSState';
import type { Message } from '@/hooks/useConversation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@supabase/auth-helpers-react';

/**
 * Hook to handle Text-to-Speech (TTS) generation for messages
 * 
 * Features:
 * - Generates TTS for both AI and user messages
 * - Handles caching of generated audio
 * - Updates message records with audio URLs
 * - Manages processing state
 * 
 * @param conversationId - The ID of the conversation context
 * @returns {Object} Methods to handle TTS generation
 */
export function useTTSHandler(conversationId: string) {
  const { generateTTS } = useTTS();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = useUser();
  const { isGeneratingTTS, startTTSGeneration, finishTTSGeneration } = useTTSState();

  /**
   * Generates TTS for a given message and updates the database
   * 
   * Process:
   * 1. Checks if TTS is needed
   * 2. Gets user's voice preference
   * 3. Generates audio
   * 4. Updates message record
   * 5. Updates UI
   * 
   * @param message - The message to generate TTS for
   */
  const generateTTSForMessage = async (message: Message) => {
    // Skip if no text or message ID
    if (!message.text || !message.id) {
      console.log('Skipping TTS generation: no text content or message ID');
      return;
    }

    // Skip if already has required audio
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

    // Skip if already processing this message
    if (isGeneratingTTS(message.id)) {
      console.log('Already processing TTS for message:', message.id);
      return;
    }

    if (!user) {
      console.error('No authenticated user found');
      toast({
        title: "Error",
        description: "You must be logged in to generate audio",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting TTS generation process for message:', message.id);
    startTTSGeneration(message.id);

    try {
      // Get user's profile to determine voice preference
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('target_language, voice_preference')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Could not fetch user profile');
      }

      if (!profile?.target_language) {
        console.error('No target language set in profile');
        throw new Error('Target language not set in your profile');
      }

      console.log('Generating audio with profile settings:', {
        targetLanguage: profile.target_language,
        voicePreference: profile.voice_preference
      });

      const audioUrl = await generateTTS(
        message.text, 
        profile.voice_preference || 'female',
        'normal'
      );

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
        description: error instanceof Error ? error.message : "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      finishTTSGeneration(message.id);
    }
  };

  return {
    generateTTSForMessage
  };
}