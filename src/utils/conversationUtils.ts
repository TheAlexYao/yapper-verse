import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export async function deleteAllUserConversations() {
  try {
    console.log('Starting deletion of all user conversations');
    
    const { error } = await supabase
      .from('guided_conversations')
      .delete()
      .neq('id', ''); // This will match all rows, but RLS will only allow deletion of user's own conversations
    
    if (error) throw error;
    
    console.log('Successfully deleted all user conversations');
    return true;
  } catch (error) {
    console.error('Error deleting conversations:', error);
    throw error;
  }
}