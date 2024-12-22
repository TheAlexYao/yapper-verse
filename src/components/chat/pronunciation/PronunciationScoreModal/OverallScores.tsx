import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface OverallScoresProps {
  scores: {
    overall: number;
    accuracy: number;
    fluency: number;
    completeness: number;
  };
}

export function OverallScores({ scores }: OverallScoresProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        Overall Scores
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Score</span>
            <span className={cn("text-3xl font-bold", getScoreColor(scores.overall))}>
              {scores.overall.toFixed(1)}%
            </span>
          </div>
          <Progress value={scores.overall} className="h-3" />
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: "Accuracy", value: scores.accuracy },
            { label: "Fluency", value: scores.fluency },
            { label: "Completeness", value: scores.completeness },
          ].map((score) => (
            <div key={score.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{score.label}</span>
                <span className={getScoreColor(score.value)}>
                  {score.value.toFixed(1)}%
                </span>
              </div>
              <Progress value={score.value} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}