import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@supabase/auth-helpers-react';
import { useEffect } from 'react';

export function useResponseGeneration(conversationId: string, trigger: 'start' | 'selection' | 'refresh' = 'selection') {
  const user = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up real-time subscription to invalidate responses when new messages arrive
  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up message subscription for responses:', conversationId);
    
    const channel = supabase
      .channel('responses-invalidation')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guided_conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Received new message, invalidating responses:', payload);
          // Invalidate the responses query when a new message is inserted
          queryClient.invalidateQueries({
            queryKey: ['responses', conversationId, user?.id, trigger]
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up responses subscription');
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
    staleTime: Infinity, // Prevent automatic refetching
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}