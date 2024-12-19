import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-primary";
    if (score >= 75) return "text-indigo-400";
    return "text-indigo-300";
  };

  const getAdvice = () => {
    const lowestScoreWord = words.reduce((prev, curr) => 
      curr.PronunciationAssessment.AccuracyScore < prev.PronunciationAssessment.AccuracyScore ? curr : prev
    );
    
    return `Focus on improving the pronunciation of "${lowestScoreWord.Word}". Try to enunciate each syllable clearly and practice the specific sounds that make up this word.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Pronunciation Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Scores */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Word-level Analysis */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Word-by-Word Analysis</h3>
            <div className="grid gap-2">
              {words.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent/50"
                >
                  <span className="font-medium">{word.Word}</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={word.PronunciationAssessment.AccuracyScore}
                      className="w-24 h-2"
                    />
                    <span className={`text-sm font-bold ${getScoreColor(word.PronunciationAssessment.AccuracyScore)}`}>
                      {Math.round(word.PronunciationAssessment.AccuracyScore)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Advice */}
          <div className="rounded-lg border border-border p-4 bg-accent/30">
            <h3 className="text-lg font-semibold mb-2">Improvement Tips</h3>
            <p className="text-sm text-muted-foreground">{getAdvice()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}