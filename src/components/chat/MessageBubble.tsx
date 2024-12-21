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
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  const handlePlayAudio = async (audioUrl: string, setPlayingState: (playing: boolean) => void) => {
    if (!audioUrl || !onPlayAudio) return;
    
    setPlayingState(true);
    try {
      await onPlayAudio(audioUrl);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setPlayingState(false);
    }
  };

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

        <div className="flex gap-2">
          {!isUser && message.tts_audio_url && (
            <AudioButton
              onPlay={() => handlePlayAudio(message.tts_audio_url!, setIsPlayingTTS)}
              isUser={message.isUser}
              isPlaying={isPlayingTTS}
              disabled={!message.tts_audio_url}
              label="TTS"
            />
          )}
          {message.audio_url && (
            <AudioButton
              onPlay={() => handlePlayAudio(message.audio_url!, setIsPlaying)}
              isUser={message.isUser}
              isPlaying={isPlaying}
              disabled={!message.audio_url}
              label="Recording"
            />
          )}
        </div>
      </div>
    </div>
  );
}