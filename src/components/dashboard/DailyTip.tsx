import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface DailyTipProps {
  language: string;
}

export function DailyTip({ language }: DailyTipProps) {
  // This would come from a tips database based on the language
  const tip = language === "fr-FR" 
    ? "Greeting the cashier before placing your order is common courtesy in French cafés."
    : "In Spanish-speaking countries, it's common to greet everyone when entering a shop.";

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium mb-1">Daily Tip</h3>
          <p className="text-muted-foreground">{tip}</p>
        </div>
      </div>
    </Card>
  );
}