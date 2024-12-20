import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, PlayCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface TextDisplayProps {
  text: string;
  translation: string;
  transliteration?: string;
  audio_url?: string;
}

export function TextDisplay({ text, translation, transliteration, audio_url }: TextDisplayProps) {
  const [volume, setVolume] = useState([1]);
  const [speed, setSpeed] = useState([1]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = () => {
    if (audio_url && audioRef.current) {
      audioRef.current.volume = volume[0];
      audioRef.current.playbackRate = speed[0];
      audioRef.current.play();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/50">
        <Button 
          variant="secondary" 
          size="icon" 
          className="shrink-0"
          onClick={handlePlayAudio}
        >
          <PlayCircle className="h-4 w-4" />
        </Button>
        <div className="flex-1 space-y-1">
          <p className="font-medium">{text}</p>
          {transliteration && (
            <p className="text-sm italic text-muted-foreground">
              {transliteration}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{translation}</p>
        </div>
      </div>

      <div className="space-y-4 p-4 rounded-lg bg-accent/30">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Volume
            </label>
            <span className="text-sm text-muted-foreground">
              {Math.round(volume[0] * 100)}%
            </span>
          </div>
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={1}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Speed
            </label>
            <span className="text-sm text-muted-foreground">
              {speed[0]}x
            </span>
          </div>
          <Slider
            value={speed}
            onValueChange={setSpeed}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>

      {audio_url && (
        <audio ref={audioRef} src={audio_url} />
      )}
    </div>
  );
}