import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@supabase/auth-helpers-react';

export function useResponseGeneration(conversationId: string, trigger: 'start' | 'selection' | 'refresh' = 'selection') {
  const user = useUser();
  const { toast } = useToast();

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
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes (replaced cacheTime with gcTime)
  });
}