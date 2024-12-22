import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface OverallScoresProps {
  scores: {
    overall: number;
    accuracy: number;
    fluency: number;
    completeness: number;
  };
}

export function OverallScores({ scores }: OverallScoresProps) {
  const getScoreColor = (value: number) => {
    if (value >= 90) return "text-green-600";
    if (value >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return "bg-green-600";
    if (value >= 75) return "bg-yellow-600";
    return "bg-red-600";
  };

  const scoreItems = [
    { label: "Accuracy", value: scores.accuracy },
    { label: "Fluency", value: scores.fluency },
    { label: "Completeness", value: scores.completeness },
  ];

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Target className="h-5 w-5" />
        Performance Metrics
      </h3>
      <div className="grid grid-cols-1 gap-6 p-4 rounded-lg bg-accent/5">
        {scoreItems.map((score) => (
          <div key={score.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{score.label}</span>
              <span className={getScoreColor(score.value)}>{score.value}%</span>
            </div>
            <Progress 
              value={score.value} 
              className={getProgressColor(score.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}