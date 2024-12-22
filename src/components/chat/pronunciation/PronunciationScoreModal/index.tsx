import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

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
  referenceAudioUrl
}: PronunciationScoreModalProps) {
  const assessment = data.NBest?.[0]?.PronunciationAssessment;
  const words = data.NBest?.[0]?.Words || [];

  const handlePlayAudio = async (audioUrl?: string) => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    await audio.play();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Pronunciation Analysis</DialogTitle>
          <DialogDescription>
            Detailed breakdown of your pronunciation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Scores */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Accuracy</span>
                <span>{assessment?.AccuracyScore.toFixed(1)}%</span>
              </div>
              <Progress value={assessment?.AccuracyScore} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Fluency</span>
                <span>{assessment?.FluencyScore.toFixed(1)}%</span>
              </div>
              <Progress value={assessment?.FluencyScore} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Completeness</span>
                <span>{assessment?.CompletenessScore.toFixed(1)}%</span>
              </div>
              <Progress value={assessment?.CompletenessScore} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Overall Score</span>
                <span>{assessment?.PronScore.toFixed(1)}%</span>
              </div>
              <Progress value={assessment?.PronScore} className="bg-accent/50" />
            </div>
          </div>

          {/* Word Analysis */}
          <div className="space-y-3">
            <h3 className="font-medium">Word-by-Word Analysis</h3>
            <div className="space-y-2">
              {words.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                >
                  <span className="font-medium">{word.Word}</span>
                  <span className={`text-sm font-medium ${
                    word.PronunciationAssessment.AccuracyScore >= 90 ? 'text-green-500' :
                    word.PronunciationAssessment.AccuracyScore >= 75 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {word.PronunciationAssessment.AccuracyScore.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Comparison */}
          <div className="space-y-3">
            <h3 className="font-medium">Compare Audio</h3>
            <div className="flex gap-3">
              {userAudioUrl && (
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-[#38b6ff] hover:bg-[#38b6ff]/10 hover:text-[#38b6ff] transition-colors"
                  onClick={() => handlePlayAudio(userAudioUrl)}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Your Recording
                </Button>
              )}
              {referenceAudioUrl && (
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-[#7843e6] hover:bg-[#7843e6]/10 hover:text-[#7843e6] transition-colors"
                  onClick={() => handlePlayAudio(referenceAudioUrl)}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Reference Audio
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}