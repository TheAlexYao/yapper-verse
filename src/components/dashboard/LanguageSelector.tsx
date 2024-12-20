import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LanguageList } from "./language/LanguageList";

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
        .select('languages_learning, target_language')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      const userLanguages = profileData?.languages_learning || [];
      setActiveLanguages(userLanguages);
      
      // If this is a newly added language, it should be selected
      if (profileData?.target_language && profileData.target_language !== currentLanguage) {
        onLanguageChange(profileData.target_language);
      }
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

  // Initial fetch of languages
  useEffect(() => {
    fetchUserLanguages();
  }, []);

  // Re-fetch languages when a new one is added
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'languageAdded') {
        fetchUserLanguages();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-medium">Currently Learning</h3>
        <LanguageList
          activeLanguages={activeLanguages}
          currentLanguage={currentLanguage}
          isLoading={isLoading}
          onLanguageChange={handleLanguageChange}
          onAddLanguage={() => {
            onAddLanguage();
            // Trigger a re-fetch after a short delay to ensure the new language is loaded
            setTimeout(fetchUserLanguages, 500);
          }}
        />
      </div>
    </Card>
  );
}