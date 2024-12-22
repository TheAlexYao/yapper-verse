import { Button } from "@/components/ui/button";
import { Play, Turtle, Loader2 } from "lucide-react";
import { useState } from "react";

interface AudioControlsProps {
  audioUrl: string;
}

export function AudioControls({ audioUrl }: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async (speed: 'normal' | 'slow') => {
    const audio = new Audio(audioUrl);
    if (speed === 'slow') {
      audio.playbackRate = 0.7;
    }
    setIsPlaying(true);
    await audio.play();
    audio.onended = () => setIsPlaying(false);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="flex-1 border-2 border-[#38b6ff] hover:bg-[#38b6ff]/10 hover:text-[#38b6ff] transition-colors"
        onClick={() => playAudio('normal')}
        disabled={isPlaying}
      >
        {isPlaying ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        Normal Speed
      </Button>
      <Button
        variant="outline"
        className="flex-1 border-2 border-[#7843e6] hover:bg-[#7843e6]/10 hover:text-[#7843e6] transition-colors"
        onClick={() => playAudio('slow')}
        disabled={isPlaying}
      >
        {isPlaying ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Turtle className="mr-2 h-6 w-6" />
        )}
        Slow Speed
      </Button>
    </div>
  );
}