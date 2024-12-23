import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";

export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const subscriptionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!conversationId) return;

    const loadInitialMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("guided_conversation_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data) {
          const transformed = data.map((row) => ({
            id: row.id,
            text: row.content,
            translation: row.translation,
            transliteration: row.transliteration,
            isUser: row.is_user,
            audio_url: row.audio_url,
            pronunciation_score: row.pronunciation_score,
            pronunciation_data: row.pronunciation_data,
            reference_audio_url: row.reference_audio_url,
          }));
          setMessages(transformed);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    loadInitialMessages();

    // Set up real-time subscription
    subscriptionRef.current = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guided_conversation_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('Received message payload:', payload);

          if (payload.eventType === 'INSERT') {
            const row = payload.new;
            setMessages((prev) => {
              // Check if message already exists
              if (prev.some(msg => msg.id === row.id)) return prev;

              return [...prev, {
                id: row.id,
                text: row.content,
                translation: row.translation,
                transliteration: row.transliteration,
                isUser: row.is_user,
                audio_url: row.audio_url,
                pronunciation_score: row.pronunciation_score,
                pronunciation_data: row.pronunciation_data,
                reference_audio_url: row.reference_audio_url,
              }];
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      if (subscriptionRef.current) {
        console.log('Cleaning up subscription');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [conversationId, toast]);

  return { messages };
}