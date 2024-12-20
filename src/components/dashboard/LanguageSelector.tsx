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

export function LanguageSelector({ 
  currentLanguage, 
  onLanguageChange,
  onAddLanguage 
}: LanguageSelectorProps) {
  const [activeLanguages, setActiveLanguages] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserLanguages() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('languages_learning')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setActiveLanguages(data.languages_learning || []);
      } catch (error) {
        console.error('Error fetching user languages:', error);
        toast({
          title: "Error",
          description: "Failed to load language preferences",
          variant: "destructive",
        });
      }
    }

    fetchUserLanguages();
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-medium">Currently Learning</h3>
        <div className="flex flex-wrap gap-2">
          {activeLanguages.map((lang) => {
            const language = languages.find(l => l.value === lang);
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