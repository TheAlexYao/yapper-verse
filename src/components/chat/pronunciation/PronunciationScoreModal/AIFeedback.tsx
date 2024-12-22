import { Sparkles } from "lucide-react";

interface AIFeedbackProps {
  score: number;
}

export function AIFeedback({ score }: AIFeedbackProps) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        AI Feedback
      </h3>
      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
        <p className="text-sm text-muted-foreground">
          {score >= 90
            ? "Excellent pronunciation! Keep up the great work."
            : score >= 75
            ? "Good pronunciation with room for improvement."
            : "Continue practicing to improve your pronunciation."}
        </p>
      </div>
    </section>
  );
}