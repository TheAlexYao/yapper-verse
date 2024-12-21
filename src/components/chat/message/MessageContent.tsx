import { cn } from "@/lib/utils";

interface MessageContentProps {
  text: string;
  transliteration?: string;
  translation?: string;
  isUser: boolean;
  pronunciationScore?: number;
  onShowScore?: () => void;
}

export function MessageContent({ 
  text, 
  transliteration, 
  translation, 
  isUser,
  pronunciationScore,
  onShowScore
}: MessageContentProps) {
  return (
    <div className="space-y-1.5 overflow-hidden">
      <p className="text-base font-medium break-words leading-relaxed">
        {text}
      </p>
      {transliteration && (
        <p className={cn(
          "text-sm italic break-words",
          isUser ? "text-[#E5DEFF]" : "text-muted-foreground"
        )}>
          {transliteration}
        </p>
      )}
      {translation && (
        <p className={cn(
          "text-sm break-words",
          isUser ? "text-[#E5DEFF]" : "text-muted-foreground"
        )}>
          {translation}
        </p>
      )}
      {isUser && typeof pronunciationScore === 'number' && (
        <button
          onClick={onShowScore}
          className="text-xs px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors mt-2"
        >
          Pronunciation Score: {pronunciationScore}%
        </button>
      )}
    </div>
  );
}