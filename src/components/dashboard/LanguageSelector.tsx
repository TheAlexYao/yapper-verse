import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { languages } from "@/components/onboarding/steps/language/languages";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { ProfilesTable } from "@/integrations/supabase/types";

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  onAddLanguage: () => void;
}

export function LanguageSelector({ 
  currentLanguage, 
  onLanguageChange,
  onAddLanguage 
}: LanguageSelectorProps) {
  const [activeLanguages, setActiveLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserLanguages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('languages_learning')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      const userLanguages = profileData.languages_learning || [];
      setActiveLanguages(userLanguages);
    } catch (error) {
      console.error('Error fetching user languages:', error);
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
    fetchUserLanguages();

    // Subscribe only to languages_learning changes
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('languages-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload: RealtimePostgresChangesPayload<ProfilesTable["Row"]>) => {
            // Only update if languages_learning has changed
            if (payload.new && Array.isArray(payload.new.languages_learning)) {
              const newLanguages = payload.new.languages_learning;
              // Only update state if the languages have actually changed
              if (JSON.stringify(newLanguages) !== JSON.stringify(activeLanguages)) {
                setActiveLanguages(newLanguages);
                
                // If this is a newly added language, switch to it
                if (newLanguages.length > activeLanguages.length) {
                  const newLanguage = newLanguages[newLanguages.length - 1];
                  handleLanguageChange(newLanguage);
                }
              }
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