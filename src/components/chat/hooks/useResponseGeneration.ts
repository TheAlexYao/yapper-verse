import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@supabase/auth-helpers-react';
import { useEffect } from 'react';

export function useResponseGeneration(conversationId: string, trigger: 'start' | 'selection' | 'refresh' = 'selection') {
  const user = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up real-time subscription to detect new AI messages only
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel('response-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guided_conversation_messages',
          filter: `conversation_id=eq.${conversationId} AND is_user=eq.false`,
        },
        async (payload) => {
          console.log('New AI message detected, refetching responses');
          await queryClient.refetchQueries({
            queryKey: ['responses', conversationId, user?.id, trigger],
            exact: true
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id, trigger, queryClient]);

  // Set up the main query to fetch recommended responses
  return useQuery({
    queryKey: ['responses', conversationId, user?.id, trigger],
    queryFn: async () => {
      if (!user?.id || !conversationId) return [];

      try {
        console.log('Fetching responses for conversation:', conversationId);
        const { data, error } = await supabase.functions.invoke('generate-responses', {
          body: {
            conversationId,
            userId: user.id,
            trigger
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
    staleTime: Infinity, // Never consider data stale automatically
    gcTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes
    refetchOnMount: false, // Don't refetch when component mounts
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  });
}