import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  full_name: string;
  languages_learning: string[];
}

export function UserGreeting() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scenariosCompleted, setScenariosCompleted] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, languages_learning')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch completed scenarios count (you might want to adjust this query based on your actual data structure)
        const { count, error: scenariosError } = await supabase
          .from('conversations')
          .select('*', { count: 'exact' })
          .eq('status', 'completed');

        if (scenariosError) throw scenariosError;
        setScenariosCompleted(count || 0);

      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      }
    }

    fetchUserData();
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-r from-[#38b6ff]/10 to-[#7843e6]/10">
      <h2 className="text-2xl font-semibold mb-2">
        Welcome back, {profile?.full_name || 'User'}!
      </h2>
      <p className="text-muted-foreground">
        You've completed {scenariosCompleted} scenarios{' '}
        {scenariosCompleted === 1 ? 'this week' : 'this week'}. Keep up the great work!
      </p>
    </Card>
  );
}