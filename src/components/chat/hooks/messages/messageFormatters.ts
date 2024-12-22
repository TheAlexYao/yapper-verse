import type { Message } from "@/hooks/useConversation";

export const formatDatabaseMessage = (newMessage: any): Message => ({
  id: newMessage.id,
  conversation_id: newMessage.conversation_id,
  text: newMessage.content,
  translation: newMessage.translation,
  transliteration: newMessage.transliteration,
  pronunciation_score: newMessage.pronunciation_score,
  pronunciation_data: newMessage.pronunciation_data,
  audio_url: newMessage.audio_url,
  reference_audio_url: newMessage.reference_audio_url,
  isUser: newMessage.is_user
});