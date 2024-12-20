import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PronunciationScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    NBest: Array<{
      PronunciationAssessment: {
        AccuracyScore: number;
        FluencyScore: number;
        CompletenessScore: number;
        PronScore: number;
      };
      Words: Array<{
        Word: string;
        PronunciationAssessment: {
          AccuracyScore: number;
          ErrorType: string;
        };
      }>;
      AudioUrl?: string;
      OriginalAudioUrl?: string;
    }>;
  };
}

export function PronunciationScoreModal({
  isOpen,
  onClose,
  data,
}: PronunciationScoreModalProps) {
  const assessment = data.NBest[0].PronunciationAssessment;
  const words = data.NBest[0].Words;
  const audioUrl = data.NBest[0].AudioUrl;
  const originalAudioUrl = data.NBest[0].OriginalAudioUrl;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-[#9b87f5]";
    if (score >= 75) return "text-[#7E69AB]";
    return "text-[#6E59A5]";
  };

  const getWordColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getAdvice = () => {
    const lowestScoreWord = words.reduce((prev, curr) => 
      curr.PronunciationAssessment.AccuracyScore < prev.PronunciationAssessment.AccuracyScore ? curr : prev
    );
    
    return `Focus on improving the pronunciation of "${lowestScoreWord.Word}". Try to enunciate each syllable clearly and practice the specific sounds that make up this word.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">Pronunciation Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Audio Comparison */}
          {(audioUrl || originalAudioUrl) && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Compare Audio</h3>
              <div className="space-y-3">
                {originalAudioUrl && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <audio src={originalAudioUrl} controls className="w-full" />
                      <p className="text-xs text-muted-foreground mt-1">Original Pronunciation</p>
                    </div>
                  </div>
                )}
                {audioUrl && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Play className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <audio src={audioUrl} controls className="w-full" />
                      <p className="text-xs text-muted-foreground mt-1">Your Pronunciation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Advice */}
          <div className="rounded-lg border border-border p-3 sm:p-4 bg-accent/30">
            <h3 className="text-lg font-semibold mb-2">Improvement Tips</h3>
            <p className="text-sm text-muted-foreground">{getAdvice()}</p>
          </div>

          {/* Overall Scores */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Pronunciation Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Accuracy</div>
                <div className="flex items-center gap-2">
                  <Progress value={assessment.AccuracyScore} className="h-2" />
                  <span className={`text-sm font-bold ${getScoreColor(assessment.AccuracyScore)}`}>
                    {Math.round(assessment.AccuracyScore)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Fluency</div>
                <div className="flex items-center gap-2">
                  <Progress value={assessment.FluencyScore} className="h-2" />
                  <span className={`text-sm font-bold ${getScoreColor(assessment.FluencyScore)}`}>
                    {Math.round(assessment.FluencyScore)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Completeness</div>
                <div className="flex items-center gap-2">
                  <Progress value={assessment.CompletenessScore} className="h-2" />
                  <span className={`text-sm font-bold ${getScoreColor(assessment.CompletenessScore)}`}>
                    {Math.round(assessment.CompletenessScore)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Overall</div>
                <div className="flex items-center gap-2">
                  <Progress value={assessment.PronScore} className="h-2" />
                  <span className={`text-sm font-bold ${getScoreColor(assessment.PronScore)}`}>
                    {Math.round(assessment.PronScore)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Word-level Analysis */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Word-by-Word Analysis</h3>
            <div className="grid gap-2">
              {words.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent/50"
                >
                  <span className={cn(
                    "font-medium",
                    getWordColor(word.PronunciationAssessment.AccuracyScore)
                  )}>
                    {word.Word}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={word.PronunciationAssessment.AccuracyScore}
                      className="w-16 sm:w-24 h-2"
                    />
                    <span className={`text-sm font-bold ${getScoreColor(word.PronunciationAssessment.AccuracyScore)}`}>
                      {Math.round(word.PronunciationAssessment.AccuracyScore)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}