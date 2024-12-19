import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PronunciationScoreModal } from "./PronunciationScoreModal";

interface MessageBubbleProps {
  isUser?: boolean;
  message: {
    text: string;
    translation?: string;
    transliteration?: string;
    pronunciationScore?: number;
    pronunciationData?: any;
    audioUrl?: string;
  };
  onPlayAudio?: () => void;
}

export function MessageBubble({ isUser, message, onPlayAudio }: MessageBubbleProps) {
  const [showScoreModal, setShowScoreModal] = useState(false);

  return (
    <>
      <div
        className={cn(
          "flex mb-4",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-[85%] rounded-2xl p-4 shadow-md transition-all duration-200 hover:shadow-lg break-words",
            isUser
              ? "bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] text-white"
              : "bg-gradient-to-r from-card to-accent/30 hover:from-accent/20 hover:to-accent/40"
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
            <div className="space-y-1.5 overflow-hidden">
              <p className="text-base font-medium break-words leading-relaxed">{message.text}</p>
              {message.transliteration && (
                <p className={cn(
                  "text-sm italic break-words",
                  isUser ? "text-[#E5DEFF]" : "text-muted-foreground"
                )}>
                  {message.transliteration}
                </p>
              )}
              {message.translation && (
                <p className={cn(
                  "text-sm break-words",
                  isUser ? "text-[#E5DEFF]" : "text-muted-foreground"
                )}>
                  {message.translation}
                </p>
              )}
              {isUser && (
                <div className="flex flex-col gap-2 mt-2">
                  {message.audioUrl && (
                    <div className="w-full max-w-[200px] rounded-lg overflow-hidden bg-black/10">
                      <audio 
                        src={message.audioUrl} 
                        controls 
                        className="w-full h-8"
                      />
                    </div>
                  )}
                  {message.pronunciationScore && (
                    <button
                      onClick={() => setShowScoreModal(true)}
                      className="text-xs px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                    >
                      Pronunciation: {message.pronunciationScore}%
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {message.pronunciationData && (
        <PronunciationScoreModal
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          data={message.pronunciationData}
        />
      )}
    </>
  );
}