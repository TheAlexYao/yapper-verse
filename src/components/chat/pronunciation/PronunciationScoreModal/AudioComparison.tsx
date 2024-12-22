import { Button } from "@/components/ui/button";
import { Volume2, AudioWaveform } from "lucide-react";

interface AudioComparisonProps {
  userAudioUrl?: string;
  referenceAudioUrl?: string;
  onPlayAudio: (url: string) => void;
}

export function AudioComparison({ userAudioUrl, referenceAudioUrl, onPlayAudio }: AudioComparisonProps) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AudioWaveform className="h-5 w-5 text-[#7843e6]" />
        Compare Audio
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userAudioUrl && (
          <Button
            variant="outline"
            className="flex-1 border-2 border-[#9b87f5] hover:bg-[#9b87f5]/10 hover:text-[#9b87f5] transition-colors"
            onClick={() => onPlayAudio(userAudioUrl)}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            Your Recording
          </Button>
        )}
        {referenceAudioUrl && (
          <Button
            variant="outline"
            className="flex-1 border-2 border-[#7843e6] hover:bg-[#7843e6]/10 hover:text-[#7843e6] transition-colors"
            onClick={() => onPlayAudio(referenceAudioUrl)}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            Reference Audio
          </Button>
        )}
      </div>
    </section>
  );
}