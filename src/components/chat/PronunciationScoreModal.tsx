import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface PronunciationData {
  score?: number;
  feedback?: string;
  suggestions?: string[];
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
}

export function PronunciationScoreModal({ isOpen, onClose, data }: PronunciationScoreModalProps) {
  // Get the first assessment result if available
  const assessment = data.NBest?.[0]?.PronunciationAssessment;
  const words = data.NBest?.[0]?.Words || [];

  // Helper function to get the color class based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  // Helper function to format error type
  const formatErrorType = (errorType: string) => {
    if (errorType === "NoAudioDetected") return "No audio detected";
    if (errorType === "Mispronunciation") return "Mispronounced";
    return errorType;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pronunciation Feedback</DialogTitle>
          <DialogDescription>
            Detailed analysis of your pronunciation
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {assessment && (
            <div className="space-y-4">
              <h3 className="font-medium">Overall Scores</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy</span>
                    <span className={getScoreColorClass(assessment.AccuracyScore)}>
                      {assessment.AccuracyScore}%
                    </span>
                  </div>
                  <Progress value={assessment.AccuracyScore} className="h-2" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Fluency</span>
                    <span className={getScoreColorClass(assessment.FluencyScore)}>
                      {assessment.FluencyScore}%
                    </span>
                  </div>
                  <Progress value={assessment.FluencyScore} className="h-2" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Completeness</span>
                    <span className={getScoreColorClass(assessment.CompletenessScore)}>
                      {assessment.CompletenessScore}%
                    </span>
                  </div>
                  <Progress value={assessment.CompletenessScore} className="h-2" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Overall</span>
                    <span className={getScoreColorClass(assessment.PronScore)}>
                      {assessment.PronScore}%
                    </span>
                  </div>
                  <Progress value={assessment.PronScore} className="h-2" />
                </div>
              </div>
            </div>
          )}

          {words.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Word-by-Word Analysis</h3>
              <div className="space-y-2">
                {words.map((word, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-3 rounded-lg bg-accent/50"
                  >
                    <div className="space-y-1">
                      <span className="font-medium">{word.Word}</span>
                      {word.PronunciationAssessment.ErrorType !== "None" && (
                        <p className="text-xs text-muted-foreground">
                          {formatErrorType(word.PronunciationAssessment.ErrorType)}
                        </p>
                      )}
                    </div>
                    <div className="text-sm">
                      {word.PronunciationAssessment.ErrorType === "NoAudioDetected" ? (
                        <span className="text-destructive">No audio</span>
                      ) : (
                        <span className={getScoreColorClass(word.PronunciationAssessment.AccuracyScore)}>
                          {word.PronunciationAssessment.AccuracyScore}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.feedback && (
            <div className="space-y-2">
              <h3 className="font-medium">Feedback</h3>
              <p className="text-sm text-muted-foreground">{data.feedback}</p>
            </div>
          )}

          {data.suggestions && data.suggestions.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Suggestions</h3>
              <ul className="list-disc list-inside space-y-1">
                {data.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}