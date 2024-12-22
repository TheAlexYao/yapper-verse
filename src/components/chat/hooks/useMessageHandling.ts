import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";

export function useMessageHandling(conversationId: string | null) {
  const { toast } = useToast();

  const handleMessageSend = useCallback(async (message: Message) => {
    if (!conversationId) {
      console.error('No conversation ID provided');
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Handling message send:', { conversationId, messageContent: message.text });
      
      // First insert the user's message
      const { error: insertError } = await supabase
        .from('guided_conversation_messages')
        .insert({
          conversation_id: conversationId,
          content: message.text,
          translation: message.translation,
          transliteration: message.transliteration,
          is_user: true,
          pronunciation_score: message.pronunciation_score,
          pronunciation_data: message.pronunciation_data,
          audio_url: message.audio_url,
          reference_audio_url: message.reference_audio_url,
        });

      if (insertError) {
        console.error('Error inserting message:', insertError);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Message inserted successfully, generating AI response');

      // Then generate AI response
      const { error: fnError } = await supabase.functions.invoke('generate-chat-response', {
        body: {
          conversationId,
          lastMessageContent: message.text
        },
      });

      if (fnError) {
        console.error('Error generating AI response:', fnError);
        toast({
          title: "Error",
          description: "Failed to generate response. Please try again.",
          variant: "destructive",
        });
      }

      console.log('AI response generation triggered successfully');
    } catch (error) {
      console.error('Error handling message:', error);
      toast({
        title: "Error",
        description: "Failed to process message. Please try again.",
        variant: "destructive",
      });
    }
  }, [conversationId, toast]);

  return { handleMessageSend };
}