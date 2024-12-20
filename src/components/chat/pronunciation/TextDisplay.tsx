import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

interface TextDisplayProps {
  text: string;
  translation: string;
  transliteration?: string;
}

export function TextDisplay({ text, translation, transliteration }: TextDisplayProps) {
  return (
    <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/50">
      <Button variant="secondary" size="icon" className="shrink-0">
        <Volume2 className="h-4 w-4" />
      </Button>
      <div className="flex-1 space-y-1">
        <p className="font-medium">{text}</p>
        {transliteration && (
          <p className="text-sm italic text-muted-foreground">
            {transliteration}
          </p>
        )}
        <p className="text-sm text-muted-foreground">{translation}</p>
      </div>
    </div>
  );
}