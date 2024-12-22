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
import { Star } from "lucide-react";

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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6" />
            Pronunciation Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-accent/5 p-8">
              <span className="text-4xl font-bold">
                {scores.overall.toFixed(0)}%
              </span>
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