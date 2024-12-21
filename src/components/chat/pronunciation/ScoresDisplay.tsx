import { Progress } from "@/components/ui/progress";

interface Score {
  name: string;
  value: number;
}

interface ScoresDisplayProps {
  scores: Score[];
}

export function ScoresDisplay({ scores }: ScoresDisplayProps) {
  if (!scores || scores.length === 0) return null;

  const getScoreColorClass = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Overall Scores</h3>
      <div className="space-y-3">
        {scores.map((score, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{score.name}</span>
              <span className={getScoreColorClass(score.value)}>
                {score.value}%
              </span>
            </div>
            <Progress value={score.value} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
}