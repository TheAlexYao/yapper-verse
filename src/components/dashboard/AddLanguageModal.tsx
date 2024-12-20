import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { languages } from "@/components/onboarding/steps/language/languages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddLanguageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLanguageModal({ open, onOpenChange }: AddLanguageModalProps) {
  const [activeLanguages, setActiveLanguages] = useState<string[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    if (open) {
      fetchUserLanguages();
    }
  }, [open]);

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

  const handleAddLanguage = async (language: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const newLanguages = [...activeLanguages, language];
      
      const { error } = await supabase
        .from('profiles')
        .update({ languages_learning: newLanguages })
        .eq('id', user.id);

      if (error) throw error;

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