import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";

export async function fetchExistingConversation(userId: string, characterId: string, scenarioId: string) {
  const { data: conversations, error: existingError } = await supabase
    .from('guided_conversations')
    .select('id')
    .eq('user_id', userId)
    .eq('character_id', characterId)
    .eq('scenario_id', scenarioId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);

  if (existingError) {
    console.error('Error checking existing conversation:', existingError);
    throw existingError;
  }

  return conversations?.[0] || null;
}

export async function createNewConversation(
  userId: string,
  characterId: string,
  scenarioId: string,
  nativeLanguageId: string,
  targetLanguageId: string
) {
  const { data: newConversation, error: conversationError } = await supabase
    .from('guided_conversations')
    .insert({
      user_id: userId,
      character_id: characterId,
      scenario_id: scenarioId,
      native_language_id: nativeLanguageId,
      target_language_id: targetLanguageId,
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

  if (conversationError || !newConversation) {
    console.error('Error creating conversation:', conversationError);
    throw conversationError;
  }

  return newConversation;
}

export async function fetchConversationMessages(conversationId: string): Promise<Message[]> {
  const { data: existingMessages, error: messagesError } = await supabase
    .from('guided_conversation_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
    throw messagesError;
  }

  return existingMessages?.map(msg => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    text: msg.content,
    translation: msg.translation,
    transliteration: msg.transliteration,
    pronunciation_score: msg.pronunciation_score,
    pronunciation_data: msg.pronunciation_data,
    audio_url: msg.audio_url,
    isUser: msg.is_user
  })) || [];
}