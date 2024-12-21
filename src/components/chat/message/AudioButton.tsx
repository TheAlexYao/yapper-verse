import { Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AudioButtonProps {
  onPlay: () => void;
  isUser?: boolean;
  isPlaying?: boolean;
  disabled?: boolean;
  label?: string;
}

export function AudioButton({ 
  onPlay, 
  isUser = false, 
  isPlaying = false, 
  disabled = false,
  label
}: AudioButtonProps) {
  return (
    <Button
      size="sm"
      variant="secondary"
      className={cn(
        "gap-1.5",
        isUser ? "bg-white/20 hover:bg-white/30" : "bg-background/50 hover:bg-background/80"
      )}
      onClick={onPlay}
      disabled={disabled || isPlaying}
    >
      {isPlaying ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {label && <span className="text-xs">{label}</span>}
    </Button>
  );
}