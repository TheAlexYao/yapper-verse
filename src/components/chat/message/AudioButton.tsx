import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioButtonProps {
  onPlay: () => void;
  isUser?: boolean;
  isPlaying?: boolean;
  disabled?: boolean;
}

export function AudioButton({
  onPlay,
  isUser = false,
  isPlaying = false,
  disabled = false
}: AudioButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onPlay}
      disabled={disabled}
      className={cn(
        "px-2 h-7",
        isUser ? "text-white hover:text-white/90" : "text-muted-foreground hover:text-foreground",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>
  );
}