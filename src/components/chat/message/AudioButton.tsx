import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioButtonProps {
  onPlay: () => void;
  isUser: boolean;
}

export function AudioButton({ onPlay, isUser }: AudioButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "mt-1 h-6 w-6",
        isUser 
          ? "hover:bg-white/10 text-white" 
          : "hover:bg-accent-foreground/10"
      )}
      onClick={onPlay}
    >
      <Play className="h-4 w-4" />
    </Button>
  );
}