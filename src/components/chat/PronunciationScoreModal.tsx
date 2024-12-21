import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

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

  // Generate AI feedback based on scores
  const generateAIFeedback = () => {
    if (!assessment) return null;

    const feedback = [];
    const { AccuracyScore, FluencyScore, CompletenessScore } = assessment;

    // Overall assessment
    if (assessment.PronScore >= 90) {
      feedback.push("Excellent pronunciation! You sound very natural.");
    } else if (assessment.PronScore >= 75) {
      feedback.push("Good pronunciation overall, with some areas for improvement.");
    } else {
      feedback.push("Your pronunciation needs some work, but don't worry - practice makes perfect!");
    }

    // Specific feedback based on scores
    if (AccuracyScore < 75) {
      feedback.push("Focus on pronouncing individual sounds more clearly.");
    }
    if (FluencyScore < 75) {
      feedback.push("Try to speak more smoothly and naturally, without too many pauses.");
    }
    if (CompletenessScore < 75) {
      feedback.push("Make sure to pronounce all parts of each word completely.");
    }

    // Word-specific feedback
    const problematicWords = words.filter(w => 
      w.PronunciationAssessment.AccuracyScore < 75 || 
      w.PronunciationAssessment.ErrorType !== "None"
    );
    if (problematicWords.length > 0) {
      feedback.push(`Pay special attention to these words: ${problematicWords.map(w => w.Word).join(", ")}`);
    }

    return feedback;
  };

  const aiFeedback = generateAIFeedback();

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
          {/* Audio Comparison Section */}
          {(referenceAudioUrl || userAudioUrl) && (
            <div className="space-y-4">
              <h3 className="font-medium">Audio Comparison</h3>
              <div className="space-y-2">
                {referenceAudioUrl && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <span className="text-sm font-medium">Native Speaker</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const audio = new Audio(referenceAudioUrl);
                        audio.play();
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {userAudioUrl && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <span className="text-sm font-medium">Your Recording</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const audio = new Audio(userAudioUrl);
                        audio.play();
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* AI Feedback Section */}
          {aiFeedback && aiFeedback.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">AI Feedback</h3>
              <div className="space-y-2">
                {aiFeedback.map((feedback, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {feedback}
                  </p>
                ))}
              </div>
            </div>
          )}

          {data.feedback && (
            <div className="space-y-2">
              <h3 className="font-medium">Additional Feedback</h3>
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
