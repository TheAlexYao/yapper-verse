import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageButton } from "./LanguageButton";

interface LanguageListProps {
  activeLanguages: string[];
  currentLanguage: string;
  isLoading: boolean;
  onLanguageChange: (lang: string) => void;
  onAddLanguage: () => void;
}

export function LanguageList({
  activeLanguages,
  currentLanguage,
  isLoading,
  onLanguageChange,
  onAddLanguage
}: LanguageListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {activeLanguages.map((lang) => (
        <LanguageButton
          key={lang}
          langCode={lang}
          isSelected={currentLanguage === lang}
          isDisabled={isLoading && currentLanguage !== lang}
          onClick={() => onLanguageChange(lang)}
        />
      ))}
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
  );
}