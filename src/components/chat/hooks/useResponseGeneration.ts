import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@supabase/auth-helpers-react';
import { useEffect } from 'react';

export function useResponseGeneration(conversationId: string, trigger: 'start' | 'selection' | 'refresh' = 'selection') {
  const user = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up real-time subscription to invalidate cache when new messages are added
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
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          console.log('New message detected, refetching responses');
          // Force refetch instead of just invalidating
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
    staleTime: 0, // Always consider the data stale
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnMount: true, // Ensure we get fresh data when component mounts
    refetchOnWindowFocus: false // Don't refetch on window focus
  });
}