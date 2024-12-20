import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Volume2, RefreshCw, BarChart2, ListTree } from "lucide-react";
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
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl sm:text-2xl font-bold">Pronunciation Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Audio Comparison */}
          {(audioUrl || originalAudioUrl) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                Compare Audio
              </h3>
              <div className="space-y-3">
                {originalAudioUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border/50">
                    <div className="flex-1">
                      <audio src={originalAudioUrl} controls className="w-full h-8" />
                      <p className="text-xs text-muted-foreground mt-2">Original Pronunciation</p>
                    </div>
                  </div>
                )}
                {audioUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border/50">
                    <div className="flex-1">
                      <audio src={audioUrl} controls className="w-full h-8" />
                      <p className="text-xs text-muted-foreground mt-2">Your Pronunciation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Advice */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              Improvement Tips
            </h3>
            <div className="rounded-lg border border-border/50 p-4 bg-accent/30">
              <p className="text-sm text-muted-foreground leading-relaxed">{getAdvice()}</p>
            </div>
          </div>

          {/* Overall Scores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
              Pronunciation Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Accuracy", value: assessment.AccuracyScore },
                { label: "Fluency", value: assessment.FluencyScore },
                { label: "Completeness", value: assessment.CompletenessScore },
                { label: "Overall", value: assessment.PronScore },
              ].map((score) => (
                <div key={score.label} className="p-3 rounded-lg bg-accent/30 border border-border/50 space-y-2">
                  <div className="text-sm font-medium">{score.label}</div>
                  <div className="flex items-center gap-2">
                    <Progress value={score.value} className="h-2" />
                    <span className={`text-sm font-bold ${getScoreColor(score.value)}`}>
                      {Math.round(score.value)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Word-level Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ListTree className="h-5 w-5 text-muted-foreground" />
              Word-by-Word Analysis
            </h3>
            <div className="space-y-2">
              {words.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-border/50"
                >
                  <span className={cn(
                    "font-medium",
                    getWordColor(word.PronunciationAssessment.AccuracyScore)
                  )}>
                    {word.Word}
                  </span>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={word.PronunciationAssessment.AccuracyScore}
                      className="w-20 sm:w-28 h-2"
                    />
                    <span className={`text-sm font-bold min-w-[3.5rem] text-right ${getScoreColor(word.PronunciationAssessment.AccuracyScore)}`}>
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