import { Button } from "@/components/ui/button";
import { Play, Turtle, Loader2 } from "lucide-react";

interface AudioControlsProps {
  onPlayNormal: () => void;
  onPlaySlow: () => void;
  isGenerating: boolean;
}

export function AudioControls({ onPlayNormal, onPlaySlow, isGenerating }: AudioControlsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="flex-1 border-2 border-[#38b6ff] hover:bg-[#38b6ff]/10 hover:text-[#38b6ff] transition-colors"
        onClick={onPlayNormal}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        Normal Speed
      </Button>
      <Button
        variant="outline"
        className="flex-1 border-2 border-[#7843e6] hover:bg-[#7843e6]/10 hover:text-[#7843e6] transition-colors"
        onClick={onPlaySlow}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Turtle className="mr-2 h-6 w-6" />
        )}
        Slow Speed
      </Button>
    </div>
  );
}