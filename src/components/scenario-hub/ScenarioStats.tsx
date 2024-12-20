import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { languages } from "@/components/onboarding/steps/language/languages";

export function ScenarioStats() {
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [completedCount, setCompletedCount] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserLanguageAndStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('target_language')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        
        if (profileData?.target_language) {
          setTargetLanguage(profileData.target_language);
          
          const { data: scenariosData, error: scenariosError } = await supabase
            .from('user_scenarios')
            .select(`
              id,
              scenarios!inner (
                languages!inner (
                  code
                )
              )
            `)
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .eq('scenarios.languages.code', profileData.target_language);

          if (scenariosError) throw scenariosError;
          setCompletedCount(scenariosData?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user language preferences",
          variant: "destructive",
        });
      }
    };

    fetchUserLanguageAndStats();
  }, [toast]);

  const languageName = languages.find(l => l.value === targetLanguage)?.label || targetLanguage;

  return (
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
        Your Language Adventures
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        You're ready to practice {languageName} through real conversations. 
        You've completed {completedCount} scenarios so far. Choose a new scenario, 
        meet the characters, and dive into interactive dialogue. Think of it like leveling up 
        your language skills as you play.
      </p>
    </div>
  );
}