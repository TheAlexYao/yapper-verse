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
  onSpeedChange?: (speed: string) => void;
}

type SpeedOption = {
  label: string;
  value: string;
  rate: number;
};

const speedOptions: SpeedOption[] = [
  { label: "Normal", value: "normal", rate: 1 },
  { label: "Slow", value: "slow", rate: 0.8 },
  { label: "Very Slow", value: "very_slow", rate: 0.5 },
];

export function TextDisplay({ 
  text, 
  translation, 
  transliteration, 
  audio_url,
  onSpeedChange 
}: TextDisplayProps) {
  const [volume, setVolume] = useState([1]);
  const [selectedSpeed, setSelectedSpeed] = useState<SpeedOption>(speedOptions[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAudioUrlForSpeed = (baseUrl: string, speed: string): string => {
    if (!baseUrl) return '';
    const urlParts = baseUrl.split('.');
    const extension = urlParts.pop();
    const baseUrlWithoutExtension = urlParts.join('.');
    
    switch (speed) {
      case 'normal':
        return `${baseUrlWithoutExtension}_normal.${extension}`;
      case 'slow':
        return `${baseUrlWithoutExtension}_slow.${extension}`;
      case 'very_slow':
        return `${baseUrlWithoutExtension}_very_slow.${extension}`;
      default:
        return baseUrl;
    }
  };

  const handlePlayAudio = async () => {
    if (!audio_url || isLoading) return;
    
    setIsLoading(true);
    try {
      // Notify parent component about speed change (for dynamic generation if needed)
      if (onSpeedChange) {
        await onSpeedChange(selectedSpeed.value);
      }

      const speedAudioUrl = getAudioUrlForSpeed(audio_url, selectedSpeed.value);
      
      if (audioRef.current) {
        audioRef.current.src = speedAudioUrl;
        audioRef.current.volume = volume[0];
        audioRef.current.playbackRate = selectedSpeed.rate;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
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
        <audio ref={audioRef} />
      )}
    </div>
  );
}