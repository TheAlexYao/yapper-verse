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
    pronunciation_score?: number;
    pronunciation_data?: any;
    audio_url?: string;
    reference_audio_url?: string;  // Added this field
  };
  onPlayAudio?: () => void;
}

export function MessageBubble({ isUser, message, onPlayAudio }: MessageBubbleProps) {
  const [showScoreModal, setShowScoreModal] = useState(false);

  const handlePlayAudio = () => {
    if (message.audio_url) {
      const audio = new Audio(message.audio_url);
      audio.play();
    } else if (onPlayAudio) {
      onPlayAudio();
    }
  };

  return (
    <>
      <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
        <div className={cn(
          "max-w-[85%] rounded-2xl p-4 shadow-md transition-all duration-200 hover:shadow-lg break-words",
          isUser
            ? "bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] text-white"
            : "bg-gradient-to-r from-card to-accent/30 hover:from-accent/20 hover:to-accent/40"
        )}>
          <div className="flex items-start gap-2">
            {((!isUser && onPlayAudio) || (isUser && message.audio_url)) && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "mt-1 h-6 w-6",
                  isUser 
                    ? "hover:bg-white/10 text-white" 
                    : "hover:bg-accent-foreground/10"
                )}
                onClick={handlePlayAudio}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            <div className="space-y-1.5 overflow-hidden">
              <p className="text-base font-medium break-words leading-relaxed">
                {message.text}
              </p>
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
              {isUser && typeof message.pronunciation_score === 'number' && (
                <button
                  onClick={() => setShowScoreModal(true)}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors mt-2"
                >
                  Pronunciation Score: {message.pronunciation_score}%
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {message.pronunciation_data && (
        <PronunciationScoreModal
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          data={message.pronunciation_data}
          userAudioUrl={message.audio_url}
          referenceAudioUrl={message.reference_audio_url}
        />
      )}
    </>
  );
}