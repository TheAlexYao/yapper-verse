import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/hooks/useConversation';

// Number of messages that indicates a completed conversation
const COMPLETION_THRESHOLD = 10;

export function useConversationCompletion(conversationId: string) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  // Listen for conversation completion
  useEffect(() => {
    if (!conversationId) return;

    // Set up subscription to track message count
    const channel = supabase
      .channel('completion-check')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guided_conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('Checking completion status after new message');
          
          // Get current messages count
          const { count } = await supabase
            .from('guided_conversation_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversationId);

          // Check if conversation is complete
          if (count && count >= COMPLETION_THRESHOLD && !isCompleted) {
            console.log('Conversation completed');
            setIsCompleted(true);
            setShowModal(true);
            
            // Update conversation status
            await supabase
              .from('guided_conversations')
              .update({ status: 'completed', completed_at: new Date().toISOString() })
              .eq('id', conversationId);

            // Don't invalidate queries, just update the status
            queryClient.setQueryData(
              ['conversation', conversationId],
              (oldData: any) => ({
                ...oldData,
                status: 'completed'
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, isCompleted, queryClient]);

  // Calculate metrics for the modal
  const getMetrics = async () => {
    const { data: messages } = await supabase
      .from('guided_conversation_messages')
      .select('pronunciation_score')
      .eq('conversation_id', conversationId)
      .eq('is_user', true);

    const scores = messages?.map(m => m.pronunciation_score || 0) || [];
    const avgScore = scores.length ? 
      Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      pronunciationScore: avgScore,
      stylePoints: scores.length * 10, // Example scoring logic
      sentencesUsed: scores.length
    };
  };

  return {
    isCompleted,
    showModal,
    setShowModal,
    getMetrics
  };
}