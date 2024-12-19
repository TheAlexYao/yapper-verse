import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <div className="flex items-start gap-2">
          {!isUser && onPlayAudio && (
            <Button
              variant="ghost"
              size="icon"
              className="mt-1 h-6 w-6"
              onClick={onPlayAudio}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          <div>
            <p className="text-base">{message.text}</p>
            {message.translation && (
              <p className="text-sm text-muted-foreground mt-1">
                {message.translation}
              </p>
            )}
            {message.transliteration && (
              <p className="text-sm italic text-muted-foreground mt-1">
                {message.transliteration}
              </p>
            )}
            {isUser && message.pronunciationScore && (
              <p className="text-xs text-muted-foreground mt-1">
                Pronunciation: {message.pronunciationScore}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}