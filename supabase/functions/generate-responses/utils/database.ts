import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
};

export const fetchConversationData = async (supabase: any, conversationId: string) => {
  const { data: conversation, error } = await supabase
    .from('guided_conversations')
    .select(`
      *,
      character:characters(*),
      scenario:scenarios(*),
      messages:guided_conversation_messages(*)
    `)
    .eq('id', conversationId)
    .single();

  if (error) {
    console.error('Error fetching conversation:', error);
    throw new Error('Failed to fetch conversation data');
  }

  return conversation;
};

export const fetchUserProfile = async (supabase: any, userId: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('Error fetching profile:', error);
    throw new Error('User profile not found');
  }

  return profile;
};