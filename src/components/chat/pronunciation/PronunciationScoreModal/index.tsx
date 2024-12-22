import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AudioComparison } from "./AudioComparison";
import { AIFeedback } from "./AIFeedback";
import { OverallScores } from "./OverallScores";
import { WordAnalysis } from "./WordAnalysis";
import { Star, Trophy } from "lucide-react";

interface PronunciationData {
  NBest?: Array<{
    PronunciationAssessment?: {
      AccuracyScore: number;
      FluencyScore: number;
      CompletenessScore: number;
      PronScore: number;
    };
    Words?: Array<{
      Word: string;
      PronunciationAssessment: {
        AccuracyScore: number;
        ErrorType: string;
      };
    }>;
  }>;
}

interface PronunciationScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PronunciationData;
  userAudioUrl?: string;
  referenceAudioUrl?: string;
}

export function PronunciationScoreModal({
  isOpen,
  onClose,
  data,
  userAudioUrl,
  referenceAudioUrl,
}: PronunciationScoreModalProps) {
  const assessment = data.NBest?.[0]?.PronunciationAssessment;
  const words = data.NBest?.[0]?.Words || [];

  const handlePlayAudio = async (audioUrl: string) => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    await audio.play();
  };

  const scores = {
    overall: assessment?.PronScore || 0,
    accuracy: assessment?.AccuracyScore || 0,
    fluency: assessment?.FluencyScore || 0,
    completeness: assessment?.CompletenessScore || 0,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-[#9b87f5]/5 via-background to-[#7843e6]/5">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-[#9b87f5] to-[#7843e6] bg-clip-text text-transparent">
            <Trophy className="h-8 w-8 text-[#7843e6]" />
            Pronunciation Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Score Circle */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-[#9b87f5]/10 to-[#7843e6]/10 border border-[#9b87f5]/20">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 animate-spin-slow">
                  <div className="h-32 w-32 rounded-full border-4 border-[#7843e6]/20 border-t-[#7843e6]"></div>
                </div>
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[#9b87f5]/10 to-[#7843e6]/10 flex items-center justify-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#7843e6] bg-clip-text text-transparent">
                    {scores.overall.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AudioComparison
            userAudioUrl={userAudioUrl}
            referenceAudioUrl={referenceAudioUrl}
            onPlayAudio={handlePlayAudio}
          />
          <AIFeedback score={scores.overall} />
          <OverallScores scores={scores} />
          <WordAnalysis words={words} />
        </div>
      </DialogContent>
    </Dialog>
  );
}