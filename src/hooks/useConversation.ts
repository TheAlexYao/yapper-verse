import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      if (!characterId) return null;
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!characterId,
  });

  const createConversation = useMutation({
    mutationFn: async () => {
      if (!character) throw new Error('No character selected');
      
      const { data: conversationData, error } = await supabase
        .from('conversations')
        .insert({
          agent_id: character.id,
          language_id: character.language_id,
          status: 'active',
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