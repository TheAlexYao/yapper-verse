import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AudioComparison } from "./pronunciation/AudioComparison";
import { AIFeedback } from "./pronunciation/AIFeedback";
import { ScoresDisplay } from "./pronunciation/ScoresDisplay";
import { WordAnalysis } from "./pronunciation/WordAnalysis";

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
  const assessment = data.NBest?.[0]?.PronunciationAssessment;
  const words = data.NBest?.[0]?.Words || [];

  const generateAIFeedback = () => {
    if (!assessment) return [];

    const feedback = [];
    const { AccuracyScore, FluencyScore, CompletenessScore } = assessment;

    if (assessment.PronScore >= 90) {
      feedback.push("Excellent pronunciation! You sound very natural.");
    } else if (assessment.PronScore >= 75) {
      feedback.push("Good pronunciation overall, with some areas for improvement.");
    } else {
      feedback.push("Your pronunciation needs some work, but don't worry - practice makes perfect!");
    }

    if (AccuracyScore < 75) {
      feedback.push("Focus on pronouncing individual sounds more clearly.");
    }
    if (FluencyScore < 75) {
      feedback.push("Try to speak more smoothly and naturally, without too many pauses.");
    }
    if (CompletenessScore < 75) {
      feedback.push("Make sure to pronounce all parts of each word completely.");
    }

    const problematicWords = words.filter(w => 
      w.PronunciationAssessment.AccuracyScore < 75 || 
      w.PronunciationAssessment.ErrorType !== "None"
    );
    if (problematicWords.length > 0) {
      feedback.push(`Pay special attention to these words: ${problematicWords.map(w => w.Word).join(", ")}`);
    }

    return feedback;
  };

  const scores = assessment ? [
    { name: "Accuracy", value: assessment.AccuracyScore },
    { name: "Fluency", value: assessment.FluencyScore },
    { name: "Completeness", value: assessment.CompletenessScore },
    { name: "Overall", value: assessment.PronScore }
  ] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pronunciation Feedback</DialogTitle>
          <DialogDescription>
            Detailed analysis of your pronunciation
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {(userAudioUrl || referenceAudioUrl) && (
            <AudioComparison
              userAudioUrl={userAudioUrl}
              referenceAudioUrl={referenceAudioUrl}
            />
          )}
          
          <AIFeedback feedback={generateAIFeedback()} />
          
          <ScoresDisplay scores={scores} />
          
          <WordAnalysis words={words} />

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