import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { languages } from "@/components/onboarding/steps/language/languages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AddLanguageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLanguageModal({ open, onOpenChange }: AddLanguageModalProps) {
  const [activeLanguages, setActiveLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLanguage, setLoadingLanguage] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (open) {
      fetchUserLanguages();
    }
  }, [open]);

  async function fetchUserLanguages() {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddLanguage = async (language: string) => {
    setLoadingLanguage(language);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const newLanguages = [...activeLanguages, language];
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          languages_learning: newLanguages,
          target_language: language // Set the new language as target
        })
        .eq('id', user.id);

      if (error) throw error;

      // Notify about the language change
      localStorage.setItem('languageAdded', Date.now().toString());
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'languageAdded',
        newValue: Date.now().toString()
      }));

      toast({
        title: "Success",
        description: "Language added successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding language:', error);
      toast({
        title: "Error",
        description: "Failed to add language",
        variant: "destructive",
      });
    } finally {
      setLoadingLanguage(null);
    }
  };

  const availableLanguages = languages.filter(lang => !activeLanguages.includes(lang.value));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Language</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {availableLanguages.map((lang) => (
                <Button
                  key={lang.value}
                  variant="outline"
                  onClick={() => handleAddLanguage(lang.value)}
                  disabled={loadingLanguage === lang.value}
                  className="w-full justify-start gap-2"
                >
                  <span>{lang.emoji}</span>
                  <span>{lang.label}</span>
                  {loadingLanguage === lang.value && (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                  )}
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}