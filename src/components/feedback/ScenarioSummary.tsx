import { CheckCircle2 } from "lucide-react";

interface ScenarioSummaryProps {
  title: string;
  completedAt: string;
  metrics: {
    pronunciation: number;
    style: number;
    formality: string;
  };
  goalAchieved: boolean;
}

export function ScenarioSummary({ title, completedAt, metrics, goalAchieved }: ScenarioSummaryProps) {
  return (
    <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-[#9b87f5]/10 to-[#7843e6]/10 border border-accent/20">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-1">Overall Performance</h2>
          <p className="text-sm text-muted-foreground">{completedAt}</p>
        </div>
        {goalAchieved && (
          <div className="flex items-center gap-2 text-[#7843e6]">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Goal Achieved</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
          <div className="text-2xl font-bold text-[#7843e6] mb-1">
            {metrics.pronunciation}%
          </div>
          <div className="text-sm text-muted-foreground">Pronunciation</div>
        </div>
        <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
          <div className="text-2xl font-bold text-[#7843e6] mb-1">
            {metrics.style}%
          </div>
          <div className="text-sm text-muted-foreground">Style</div>
        </div>
        <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
          <div className="text-sm font-medium mb-1">{metrics.formality}</div>
          <div className="text-sm text-muted-foreground">Tone</div>
        </div>
      </div>
    </div>
  );
}