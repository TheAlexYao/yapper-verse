import { supabase } from "@/integrations/supabase/client";

export async function setupLanguages() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('No authenticated user');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('native_language, target_language')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    throw profileError;
  }

  if (!profile?.native_language || !profile?.target_language) {
    throw new Error('Language preferences not set');
  }

  const { data: languages, error: languagesError } = await supabase
    .from('languages')
    .select('id, code')
    .in('code', [profile.native_language, profile.target_language]);

  if (languagesError || !languages || languages.length !== 2) {
    console.error('Error fetching languages:', languagesError);
    throw new Error('Could not find language IDs');
  }

  const nativeLanguageId = languages.find(l => l.code === profile.native_language)?.id;
  const targetLanguageId = languages.find(l => l.code === profile.target_language)?.id;

  if (!nativeLanguageId || !targetLanguageId) {
    throw new Error('Language IDs not found');
  }

  return { nativeLanguageId, targetLanguageId, userId: user.id };
}