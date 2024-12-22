import { useState } from "react";
import { MessageContent } from "./message/MessageContent";
import { AudioButton } from "./message/AudioButton";
import { cn } from "@/lib/utils";
import type { Message } from "@/hooks/useConversation";

interface MessageBubbleProps {
  isUser?: boolean;
  message: Message;
  onPlayAudio?: (audioUrl: string) => void;
  onShowScore?: (message: Message) => void;
}

export function MessageBubble({ isUser = false, message, onPlayAudio, onShowScore }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    
    const audioUrl = isUser ? message.reference_audio_url : message.audio_url;
    
    if (!audioUrl || !onPlayAudio) {
      console.error('No audio URL available or no play handler');
      return;
    }
    
    setIsPlaying(true);
    try {
      await onPlayAudio(audioUrl);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const shouldShowAudio = isUser ? !!message.reference_audio_url : !!message.audio_url;

  return (
    <div className={cn(
      "flex gap-2",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex flex-col gap-2 max-w-[80%] rounded-2xl p-4",
        isUser ? "bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white" : "bg-accent"
      )}>
        <MessageContent
          text={message.text}
          transliteration={message.transliteration}
          translation={message.translation}
          isUser={message.isUser}
          pronunciationScore={message.pronunciation_score}
          onShowScore={() => onShowScore?.(message)}
        />

        {shouldShowAudio && (
          <AudioButton
            onPlay={handlePlayAudio}
            isUser={message.isUser}
            isPlaying={isPlaying}
            disabled={!shouldShowAudio}
          />
        )}
      </div>
    </div>
  );
}