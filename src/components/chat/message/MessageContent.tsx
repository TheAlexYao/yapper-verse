import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MessageContentProps {
  text: string;
  transliteration?: string | null;
  translation?: string | null;
  isUser?: boolean;
  pronunciationScore?: number | null;
  onShowScore?: () => void;
  className?: string;
}

export function MessageContent({
  text,
  transliteration,
  translation,
  isUser = false,
  pronunciationScore,
  onShowScore,
  className,
}: MessageContentProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className={cn(
        "text-base leading-relaxed",
        isUser ? "text-white" : "text-foreground"
      )}>
        {text}
      </p>

      {transliteration && (
        <p className={cn(
          "text-sm",
          isUser ? "text-white/80" : "text-muted-foreground"
        )}>
          {transliteration}
        </p>
      )}

      {translation && (
        <p className={cn(
          "text-sm italic",
          isUser ? "text-white/80" : "text-muted-foreground"
        )}>
          {translation}
        </p>
      )}

      {pronunciationScore !== null && pronunciationScore !== undefined && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowScore}
          className={cn(
            "px-2 h-7 text-xs",
            isUser ? "text-white hover:text-white/90" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Score: {pronunciationScore}%
        </Button>
      )}
    </div>
  );
}