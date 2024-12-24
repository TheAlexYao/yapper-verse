import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/hooks/useConversation';

// Number of user messages that indicates a completed conversation
const COMPLETION_THRESHOLD = 10;

export function useConversationCompletion(conversationId: string) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  // Check initial completion status
  useEffect(() => {
    const checkInitialStatus = async () => {
      if (!conversationId) return;

      const { count } = await supabase
        .from('guided_conversation_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('is_user', true);

      if (count && count >= COMPLETION_THRESHOLD) {
        console.log('Initial check: Conversation completed with', count, 'messages');
        setIsCompleted(true);
        setShowModal(true);
      }
    };

    checkInitialStatus();
  }, [conversationId]);

  // Listen for conversation completion
  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up completion check subscription for conversation:', conversationId);
    
    // Set up subscription to track message count
    const channel = supabase
      .channel(`completion-check-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guided_conversation_messages',
          filter: `conversation_id=eq.${conversationId} AND is_user=eq.true`
        },
        async () => {
          console.log('Checking completion status after new user message');
          
          // Get current user messages count from the database
          const { count } = await supabase
            .from('guided_conversation_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversationId)
            .eq('is_user', true);

          console.log('Current user message count:', count);

          // Show completion modal when user message count reaches threshold
          if (count && count >= COMPLETION_THRESHOLD && !isCompleted) {
            console.log('Conversation completed');
            setIsCompleted(true);
            setShowModal(true);
            
            // Update conversation status in database
            await supabase
              .from('guided_conversations')
              .update({ 
                status: 'completed', 
                completed_at: new Date().toISOString(),
                metrics: {
                  sentencesUsed: count,
                  completedAt: new Date().toISOString()
                }
              })
              .eq('id', conversationId);

            // Update local cache without invalidating queries
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

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up completion check subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId, isCompleted, queryClient]);

  // Calculate metrics for the completion modal
  const getMetrics = async () => {
    const { data: messages } = await supabase
      .from('guided_conversation_messages')
      .select('pronunciation_score')
      .eq('conversation_id', conversationId)
      .eq('is_user', true);

    // Calculate average pronunciation score
    const scores = messages?.map(m => m.pronunciation_score || 0) || [];
    const avgScore = scores.length ? 
      Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      pronunciationScore: avgScore,
      stylePoints: scores.length * 10, // Points based on number of messages
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