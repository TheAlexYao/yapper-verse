import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@supabase/auth-helpers-react';
import { useEffect } from 'react';

export function useResponseGeneration(conversationId: string, trigger: 'start' | 'selection' | 'refresh' = 'selection') {
  const user = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up real-time subscription to detect new messages and trigger response updates
  useEffect(() => {
    if (!conversationId) return;

    // Create a Supabase real-time channel to listen for new messages
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
          // Force an immediate refetch of responses when a new message is detected
          // Using exact: true ensures we only refetch this specific query
          await queryClient.refetchQueries({
            queryKey: ['responses', conversationId, user?.id, trigger],
            exact: true
          });
        }
      )
      .subscribe();

    // Cleanup subscription when component unmounts
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
        // Call edge function to generate new responses
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
    enabled: !!conversationId && !!user?.id, // Only run query when we have required data
    staleTime: 0, // Always consider the data stale to ensure fresh responses
    gcTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes
    refetchOnMount: true, // Get fresh data whenever component mounts
    refetchOnWindowFocus: false // Prevent unnecessary refetches when window regains focus
  });
}