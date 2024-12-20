import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@supabase/auth-helpers-react";

export interface Message {
  id: string;
  text: string;
  translation?: string;
  transliteration?: string;
  pronunciationScore?: number;
  pronunciationData?: any;
  audioUrl?: string;
  isUser: boolean;
}

export const useConversation = (characterId: string | undefined) => {
  const { toast } = useToast();
  const auth = useAuth();

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      if (!characterId) return null;
      const { data, error } = await supabase
        .from('characters')
        .select('*, scenario:scenarios(language_id)')
        .eq('id', characterId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!characterId,
  });

  const createConversation = useMutation({
    mutationFn: async () => {
      if (!character?.scenario?.language_id) throw new Error('No language selected');
      if (!auth.user?.id) throw new Error('No user authenticated');
      
      const { data: conversationData, error } = await supabase
        .from('conversations')
        .insert({
          agent_id: character.id,
          language_id: character.scenario.language_id,
          status: 'active',
          user_id: auth.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return conversationData;
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    },
  });

  return {
    character,
    createConversation,
  };
};