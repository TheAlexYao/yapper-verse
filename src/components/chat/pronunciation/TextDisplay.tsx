import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, PlayCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface TextDisplayProps {
  text: string;
  translation: string;
  transliteration?: string;
  audio_url?: string;
}

type SpeedOption = {
  label: string;
  value: number;
};

const speedOptions: SpeedOption[] = [
  { label: "Normal", value: 1 },
  { label: "Slow", value: 0.8 },
  { label: "Very Slow", value: 0.5 },
];

export function TextDisplay({ text, translation, transliteration, audio_url }: TextDisplayProps) {
  const [volume, setVolume] = useState([1]);
  const [selectedSpeed, setSelectedSpeed] = useState<SpeedOption>(speedOptions[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = () => {
    if (audio_url && audioRef.current) {
      audioRef.current.volume = volume[0];
      audioRef.current.playbackRate = selectedSpeed.value;
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
          <label className="text-sm font-medium">
            Speed
          </label>
          <div className="flex gap-2">
            {speedOptions.map((option) => (
              <Button
                key={option.label}
                variant={selectedSpeed.value === option.value ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  selectedSpeed.value === option.value && "bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
                )}
                onClick={() => setSelectedSpeed(option)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {audio_url && (
        <audio ref={audioRef} src={audio_url} />
      )}
    </div>
  );
}