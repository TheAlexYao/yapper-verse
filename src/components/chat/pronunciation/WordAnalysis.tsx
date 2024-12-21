interface WordData {
  Word: string;
  PronunciationAssessment: {
    AccuracyScore: number;
    ErrorType: string;
  };
}

interface WordAnalysisProps {
  words: WordData[];
}

export function WordAnalysis({ words }: WordAnalysisProps) {
  if (!words || words.length === 0) return null;

  const getScoreColorClass = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const formatErrorType = (errorType: string) => {
    if (errorType === "NoAudioDetected") return "No audio detected";
    if (errorType === "Mispronunciation") return "Mispronounced";
    return errorType;
  };

  return (
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
  );
}