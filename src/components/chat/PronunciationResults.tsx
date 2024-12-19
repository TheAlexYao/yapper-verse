import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Volume2, Mic } from "lucide-react";

interface Word {
  word: string;
  score: number;
  isCorrect: boolean;
}

interface PronunciationResultsProps {
  score: number;
  transcript: string;
  words: Word[];
  userAudioUrl: string | null;
  originalAudioUrl?: string;
  aiTips: string[];
}

export function PronunciationResults({
  score,
  transcript,
  words,
  userAudioUrl,
  originalAudioUrl,
  aiTips,
}: PronunciationResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-[#9b87f5]";
    if (score >= 75) return "text-[#7E69AB]";
    return "text-[#6E59A5]";
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center space-y-2">
        <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
          {score}%
        </div>
        <Progress value={score} className="h-2" />
        <div className="text-sm text-muted-foreground">
          Pronunciation Score
        </div>
      </div>

      {/* Audio Comparison */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Compare Audio</h3>
        <div className="grid gap-2">
          {originalAudioUrl && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
              <Button variant="secondary" size="icon" className="shrink-0">
                <Volume2 className="h-4 w-4" />
              </Button>
              <span className="text-sm">Original Pronunciation</span>
              <audio src={originalAudioUrl} controls className="w-full" />
            </div>
          )}
          {userAudioUrl && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
              <Button variant="secondary" size="icon" className="shrink-0">
                <Mic className="h-4 w-4" />
              </Button>
              <span className="text-sm">Your Recording</span>
              <audio src={userAudioUrl} controls className="w-full" />
            </div>
          )}
        </div>
      </div>

      {/* Highlighted Transcript */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Word Analysis</h3>
        <p className="leading-relaxed">
          {words.map((word, index) => (
            <span
              key={index}
              className={`${
                word.isCorrect
                  ? "text-foreground"
                  : "text-destructive underline decoration-wavy"
              } ${index > 0 ? "ml-1" : ""}`}
            >
              {word.word}
            </span>
          ))}
        </p>
      </div>

      {/* AI Tips */}
      <div className="rounded-lg border border-border p-4 bg-accent/30">
        <h3 className="text-lg font-semibold mb-2">Improvement Tips</h3>
        <ul className="space-y-2">
          {aiTips.map((tip, index) => (
            <li key={index} className="text-sm text-muted-foreground">
              • {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}