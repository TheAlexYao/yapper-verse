import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="pronunciation-feedback">
        <DialogHeader>
          <DialogTitle>Pronunciation Feedback</DialogTitle>
          <DialogDescription id="pronunciation-feedback">
            Detailed analysis of your pronunciation
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {assessment && (
            <div className="space-y-2">
              <h3 className="font-medium">Overall Scores</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Accuracy: {assessment.AccuracyScore}%</div>
                <div>Fluency: {assessment.FluencyScore}%</div>
                <div>Completeness: {assessment.CompletenessScore}%</div>
                <div>Overall: {assessment.PronScore}%</div>
              </div>
            </div>
          )}

          {words.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Word-by-Word Analysis</h3>
              <div className="space-y-1">
                {words.map((word, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-2 rounded bg-accent/50"
                  >
                    <span>{word.Word}</span>
                    <div className="text-sm">
                      {word.PronunciationAssessment.ErrorType === "NoAudioDetected" ? (
                        <span className="text-destructive">No audio detected</span>
                      ) : (
                        <span>{word.PronunciationAssessment.AccuracyScore}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.feedback && (
            <div>
              <h3 className="font-medium mb-2">Feedback</h3>
              <p className="text-sm text-muted-foreground">{data.feedback}</p>
            </div>
          )}

          {data.suggestions && data.suggestions.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Suggestions</h3>
              <ul className="list-disc list-inside space-y-1">
                {data.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}