import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { languages } from "@/components/onboarding/steps/language/languages";

interface LanguageButtonProps {
  langCode: string;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function LanguageButton({ 
  langCode, 
  isSelected, 
  isDisabled, 
  onClick 
}: LanguageButtonProps) {
  const language = languages.find(l => l.value === langCode);
  if (!language) return null;
  
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      onClick={onClick}
      className="gap-2"
      disabled={isDisabled}
    >
      <span>{language.emoji}</span>
      <span>{language.label}</span>
      {isDisabled && !isSelected && (
        <Loader2 className="ml-auto h-4 w-4 animate-spin" />
      )}
    </Button>
  );
}