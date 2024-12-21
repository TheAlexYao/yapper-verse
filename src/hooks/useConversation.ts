import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@supabase/auth-helpers-react";
import type { GuidedConversation, GuidedMessage } from "@/types/conversation";

export type Message = Omit<GuidedMessage, 'content' | 'is_user'> & {
  text: string;  // maps to content
  isUser: boolean;  // maps to is_user
  reference_audio_url?: string;
};

export const useConversation = (characterId: string | undefined) => {
  const { toast } = useToast();
  const user = useUser();

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      if (!characterId) return null;
      
      // First fetch the character
      const { data: characterData, error: characterError } = await supabase
        .from('characters')
        .select(`
          *,
          scenario:scenarios(
            *,
            languages:scenario_languages(
              language:languages(*)
            )
          )
        `)
        .eq('id', characterId)
        .single();

      if (characterError) throw characterError;
      return characterData;
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
      if (!user?.id) throw new Error('No user authenticated');

      // First verify the language IDs exist
      const { data: languageData, error: languageError } = await supabase
        .from('languages')
        .select('id')
        .in('id', [params.nativeLanguageId, params.targetLanguageId]);

      if (languageError) throw languageError;
      if (!languageData || languageData.length !== 2) {
        throw new Error('Invalid language IDs provided');
      }
      
      const { data: conversationData, error } = await supabase
        .from('guided_conversations')
        .insert({
          user_id: user.id,
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

      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }
      return conversationData;
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    character,
    createConversation,
  };
};