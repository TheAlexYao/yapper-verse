import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@supabase/auth-helpers-react";
import type { GuidedConversation, GuidedMessage } from "@/types/conversation";

export type Message = GuidedMessage;

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
    mutationFn: async (params: {
      characterId: string;
      scenarioId: string;
      nativeLanguageId: string;
      targetLanguageId: string;
    }) => {
      if (!auth.user?.id) throw new Error('No user authenticated');
      
      const { data: conversationData, error } = await supabase
        .from('guided_conversations')
        .insert({
          user_id: auth.user.id,
          character_id: params.characterId,
          scenario_id: params.scenarioId,
          native_language_id: params.nativeLanguageId,
          target_language_id: params.targetLanguageId,
          status: 'active',
          metrics: {
            pronunciationScore: 0,
            stylePoints: 0,
            sentencesUsed: 0,
            sentenceLimit: 10
          }
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