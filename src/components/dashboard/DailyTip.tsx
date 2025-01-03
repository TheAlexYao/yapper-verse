import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DailyTipProps {
  language: string;
}

interface Tip {
  tip_text: string;
  cultural_context: string | null;
}

export function DailyTip({ language }: DailyTipProps) {
  const [tip, setTip] = useState<Tip | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDailyTip() {
      try {
        // Get random tip for the selected language
        const { data, error } = await supabase
          .from('daily_tips')
          .select('tip_text, cultural_context')
          .eq('language_code', language)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setTip(data);
        }
      } catch (error) {
        console.error('Error fetching daily tip:', error);
        toast({
          title: "Error",
          description: "Failed to load daily tip",
          variant: "destructive",
        });
      }
    }

    if (language) {
      fetchDailyTip();
    }
  }, [language, toast]);

  if (!tip) return null;

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">Daily Tip</h3>
          <p className="text-muted-foreground">{tip.tip_text}</p>
          {tip.cultural_context && (
            <p className="text-sm text-muted-foreground/80 italic">
              {tip.cultural_context}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}