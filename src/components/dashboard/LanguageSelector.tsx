import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { languages } from "@/components/onboarding/steps/language/languages";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  onAddLanguage: () => void;
}

interface LanguageStats {
  languageCode: string;
  completedScenarios: number;
}

export function LanguageSelector({ 
  currentLanguage, 
  onLanguageChange,
  onAddLanguage 
}: LanguageSelectorProps) {
  const [activeLanguages, setActiveLanguages] = useState<string[]>([]);
  const [languageStats, setLanguageStats] = useState<LanguageStats[]>([]);
  const { toast } = useToast();

  const fetchUserLanguagesAndStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's active languages
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('languages_learning')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      const userLanguages = profileData.languages_learning || [];
      setActiveLanguages(userLanguages);

      // Fetch completed scenarios count for each language
      const { data: scenariosData, error: scenariosError } = await supabase
        .from('user_scenarios')
        .select(`
          id,
          scenarios (
            language_id,
            languages (
              code
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (scenariosError) throw scenariosError;

      // Calculate completed scenarios per language
      const stats = userLanguages.map(langCode => {
        const completedCount = scenariosData.filter(scenario => 
          scenario.scenarios?.languages?.code === langCode
        ).length;

        return {
          languageCode: langCode,
          completedScenarios: completedCount
        };
      });

      setLanguageStats(stats);

    } catch (error) {
      console.error('Error fetching user languages and stats:', error);
      toast({
        title: "Error",
        description: "Failed to load language data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUserLanguagesAndStats();

    // Subscribe to real-time updates for the profiles table
    const { data: { user } } = supabase.auth.getUser();
    if (!user) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const updatedLanguages = payload.new.languages_learning || [];
          setActiveLanguages(updatedLanguages);
          // Refetch stats for the updated languages
          fetchUserLanguagesAndStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-medium">Currently Learning</h3>
        <div className="flex flex-wrap gap-2">
          {activeLanguages.map((lang) => {
            const language = languages.find(l => l.value === lang);
            const stats = languageStats.find(s => s.languageCode === lang);
            if (!language) return null;
            
            return (
              <Button
                key={lang}
                variant={currentLanguage === lang ? "default" : "outline"}
                onClick={() => onLanguageChange(lang)}
                className="gap-2"
              >
                <span>{language.emoji}</span>
                <span>{language.label}</span>
                {stats && (
                  <span className="ml-2 text-xs bg-accent/50 px-2 py-0.5 rounded-full">
                    {stats.completedScenarios} completed
                  </span>
                )}
              </Button>
            );
          })}
          <Button 
            variant="outline" 
            onClick={onAddLanguage}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Language
          </Button>
        </div>
      </div>
    </Card>
  );
}