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

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-gradient-to-r from-green-500 to-green-600";
    if (score >= 75) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    return "bg-gradient-to-r from-red-500 to-red-600";
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Target className="h-5 w-5 text-[#7843e6]" />
        Performance Metrics
      </h3>
      <div className="grid grid-cols-1 gap-6 p-4 rounded-lg bg-gradient-to-br from-[#9b87f5]/5 via-accent/5 to-[#7843e6]/5">
        {[
          { label: "Accuracy", value: scores.accuracy },
          { label: "Fluency", value: scores.fluency },
          { label: "Completeness", value: scores.completeness },
        ].map((score) => (
          <div key={score.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{score.label}</span>
              <span className={cn("font-medium", getScoreColor(score.value))}>
                {score.value.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={score.value} 
              className="h-2"
              className={cn(
                "h-2 rounded-full overflow-hidden bg-accent/10",
                "[&>div]:transition-all [&>div]:duration-500"
              )}
            >
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  getProgressColor(score.value)
                )}
                style={{ width: `${score.value}%` }}
              />
            </Progress>
          </div>
        ))}
      </div>
    </section>
  );
}