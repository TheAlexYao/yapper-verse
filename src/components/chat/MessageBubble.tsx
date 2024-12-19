import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  isUser?: boolean;
  message: {
    text: string;
    translation?: string;
    transliteration?: string;
    pronunciationScore?: number;
  };
  onPlayAudio?: () => void;
}

export function MessageBubble({ isUser, message, onPlayAudio }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-4 shadow-md transition-all duration-200 hover:shadow-lg break-words",
          isUser
            ? "bg-yapper-indigo text-white"
            : "bg-card hover:bg-accent/50"
        )}
      >
        <div className="flex items-start gap-2">
          {!isUser && onPlayAudio && (
            <Button
              variant="ghost"
              size="icon"
              className="mt-1 h-6 w-6 hover:bg-accent-foreground/10"
              onClick={onPlayAudio}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          <div className="space-y-1">
            <p className="text-base font-medium break-words">{message.text}</p>
            {message.transliteration && (
              <p className={cn(
                "text-sm italic",
                isUser ? "text-indigo-100" : "text-muted-foreground"
              )}>
                {message.transliteration}
              </p>
            )}
            {message.translation && (
              <p className={cn(
                "text-sm",
                isUser ? "text-indigo-100" : "text-muted-foreground"
              )}>
                {message.translation}
              </p>
            )}
            {isUser && message.pronunciationScore && (
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs px-2 py-1 rounded-full bg-indigo-400/20">
                  Pronunciation: {message.pronunciationScore}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}