import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { languages } from "@/components/onboarding/steps/language/languages";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddLanguageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLanguageModal({ open, onOpenChange }: AddLanguageModalProps) {
  const activeLanguages = ["fr-FR", "es-ES"]; // This would come from user data
  const availableLanguages = languages.filter(lang => !activeLanguages.includes(lang.value));

  const handleAddLanguage = (language: string) => {
    // This would update user data
    console.log("Adding language:", language);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Language</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {availableLanguages.map((lang) => (
              <Button
                key={lang.value}
                variant="outline"
                onClick={() => handleAddLanguage(lang.value)}
                className="w-full justify-start gap-2"
              >
                <span>{lang.emoji}</span>
                <span>{lang.label}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}