import { Button } from "@/components/ui/button";
import { Play, Turtle } from "lucide-react";
import { useAudioPlayback } from "../../hooks/useAudioPlayback";

interface AudioControlsProps {
  text: string;
}

export function AudioControls({ text }: AudioControlsProps) {
  const { playAudio, isPlaying, isLoadingProfile } = useAudioPlayback({ text });

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="flex-1 border-2 border-[#38b6ff] hover:bg-[#38b6ff]/10 hover:text-[#38b6ff] transition-colors"
        onClick={() => playAudio('normal')}
        disabled={isPlaying || isLoadingProfile}
      >
        <Play className="mr-2 h-4 w-4" />
        {isLoadingProfile ? "Loading..." : "Normal Speed"}
      </Button>
      <Button
        variant="outline"
        className="flex-1 border-2 border-[#7843e6] hover:bg-[#7843e6]/10 hover:text-[#7843e6] transition-colors"
        onClick={() => playAudio('slow')}
        disabled={isPlaying || isLoadingProfile}
      >
        <Turtle className="mr-2 h-6 w-6" />
        {isLoadingProfile ? "Loading..." : "Slow Speed"}
      </Button>
    </div>
  );
}