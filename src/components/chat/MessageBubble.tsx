import { useState } from "react";
import { MessageContent } from "./message/MessageContent";
import { AudioButton } from "./message/AudioButton";
import { cn } from "@/lib/utils";
import type { Message } from "@/hooks/useConversation";
import { useToast } from "@/hooks/use-toast";

interface MessageBubbleProps {
  isUser?: boolean;
  message: Message;
  onPlayAudio?: (audioUrl: string) => void;
  onShowScore?: (message: Message) => void;
}

export function MessageBubble({ 
  isUser = false, 
  message, 
  onPlayAudio, 
  onShowScore 
}: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const handlePlayAudio = async () => {
    if (isPlaying || !message.audio_url || !onPlayAudio) {
      return;
    }
    
    try {
      setIsPlaying(true);
      await onPlayAudio(message.audio_url);
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlaying(false);
    }
  };

  const containerClasses = cn(
    "flex gap-2",
    isUser ? "flex-row-reverse" : "flex-row"
  );

  const bubbleClasses = cn(
    "flex flex-col gap-2 max-w-[80%] rounded-2xl p-4",
    isUser ? "bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white" : "bg-accent"
  );

  return (
    <div className={containerClasses}>
      <div className={bubbleClasses}>
        <MessageContent
          text={message.text}
          transliteration={message.transliteration}
          translation={message.translation}
          isUser={isUser}
          pronunciationScore={message.pronunciation_score}
          onShowScore={() => onShowScore?.(message)}
          className={isUser ? "text-white" : ""}
        />

        {message.audio_url && (
          <AudioButton
            onPlay={handlePlayAudio}
            isUser={isUser}
            isPlaying={isPlaying}
            disabled={!message.audio_url}
          />
        )}
      </div>
    </div>
  );
}