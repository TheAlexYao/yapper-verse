import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";

export function UserGreeting() {
  const user = useUser();
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['conversation-stats'],
    queryFn: async () => {
      const { data: conversations, error } = await supabase
        .from('guided_conversations')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      return {
        total: conversations?.length || 0,
        completed: conversations?.filter(c => c.status === 'completed').length || 0
      };
    },
    enabled: !!user?.id,
  });

  return (
    <div>
      <h1>Welcome, {profile?.full_name || "User"}!</h1>
      <p>You have completed {stats?.completed} out of {stats?.total} conversations.</p>
    </div>
  );
}
