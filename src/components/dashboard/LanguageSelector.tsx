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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserLanguagesAndStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's active languages and stats in parallel
      const [profileResponse, scenariosResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('languages_learning, target_language')
          .eq('id', user.id)
          .single(),
        supabase
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
          .eq('status', 'completed')
      ]);

      if (profileResponse.error) throw profileResponse.error;
      
      const userLanguages = profileResponse.data.languages_learning || [];
      setActiveLanguages(userLanguages);

      // If this is a newly added language, switch to it
      if (userLanguages.length > activeLanguages.length) {
        const newLanguage = userLanguages[userLanguages.length - 1];
        handleLanguageChange(newLanguage);
      }

      if (scenariosResponse.error) throw scenariosResponse.error;

      // Calculate completed scenarios per language
      const stats = userLanguages.map(langCode => {
        const completedCount = scenariosResponse.data.filter(scenario => 
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

  const handleLanguageChange = async (langCode: string) => {
    if (isLoading || currentLanguage === langCode) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ target_language: langCode })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onLanguageChange(langCode);
    } catch (error) {
      console.error('Error updating target language:', error);
      toast({
        title: "Error",
        description: "Failed to update target language",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLanguagesAndStats();

    // Subscribe to real-time updates for the profiles table
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
            // Only refetch stats if languages have changed
            if (JSON.stringify(updatedLanguages) !== JSON.stringify(activeLanguages)) {
              fetchUserLanguagesAndStats();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
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
            
            const isSelected = currentLanguage === lang;
            const isDisabled = isLoading && !isSelected;
            
            return (
              <Button
                key={lang}
                variant={isSelected ? "default" : "outline"}
                onClick={() => handleLanguageChange(lang)}
                className="gap-2"
                disabled={isDisabled}
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
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            Add Language
          </Button>
        </div>
      </div>
    </Card>
  );
}