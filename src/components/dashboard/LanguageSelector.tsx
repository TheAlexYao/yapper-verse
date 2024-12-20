import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { languages } from "@/components/onboarding/steps/language/languages";

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
  const activeLanguages = ["fr-FR", "es-ES"]; // This would come from user data

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