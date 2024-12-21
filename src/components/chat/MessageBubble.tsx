import { cn } from "@/lib/utils";
import { useState } from "react";
import { PronunciationScoreModal } from "./pronunciation/PronunciationScoreModal";
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
  onPlayAudio?: (text: string) => void;
}

export function MessageBubble({ isUser = false, message, onPlayAudio }: MessageBubbleProps) {
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      if (message.audio_url) {
        const audio = new Audio(message.audio_url);
        await audio.play();
      } else if (onPlayAudio) {
        await onPlayAudio(message.text);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
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
              <AudioButton 
                onPlay={handlePlayAudio}
                isUser={isUser}
                isPlaying={isPlaying}
              />
            )}
            <MessageContent 
              text={message.text}
              translation={message.translation}
              transliteration={message.transliteration}
              isUser={isUser}
              pronunciationScore={message.pronunciation_score}
              onShowScore={() => setShowScoreModal(true)}
            />
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