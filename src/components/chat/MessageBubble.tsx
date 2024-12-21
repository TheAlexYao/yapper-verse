import { cn } from "@/lib/utils";
import { useState } from "react";
import { MessageContent } from "./message/MessageContent";
import { AudioButton } from "./message/AudioButton";

interface MessageBubbleProps {
  isUser?: boolean;
  message: {
    text: string;
    translation?: string;
    transliteration?: string;
    pronunciation_score?: number;
    pronunciation_data?: any;
    audio_url?: string;
    reference_audio_url?: string;
  };
  onPlayAudio?: (audioUrl: string) => void;
}

export function MessageBubble({ isUser = false, message, onPlayAudio }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async () => {
    if (isPlaying || !message.audio_url || !onPlayAudio) return;
    
    setIsPlaying(true);
    try {
      await onPlayAudio(message.audio_url);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className={cn(
      "flex mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[85%] rounded-2xl p-4 shadow-md transition-all duration-200 hover:shadow-lg break-words",
        isUser
          ? "bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] text-white"
          : "bg-gradient-to-r from-card to-accent/30 hover:from-accent/20 hover:to-accent/40"
      )}>
        <div className="flex items-start gap-2">
          {((!isUser && onPlayAudio) || (isUser && message.audio_url)) && (
            <AudioButton 
              onPlay={handlePlayAudio}
              isUser={isUser}
              isPlaying={isPlaying}
              disabled={!message.audio_url}
            />
          )}
          <MessageContent 
            text={message.text}
            translation={message.translation}
            transliteration={message.transliteration}
            isUser={isUser}
            pronunciationScore={message.pronunciation_score}
          />
        </div>
      </div>
    </div>
  );
}