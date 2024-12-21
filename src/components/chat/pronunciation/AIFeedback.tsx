interface AIFeedbackProps {
  feedback: string[];
}

export function AIFeedback({ feedback }: AIFeedbackProps) {
  if (!feedback || feedback.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-medium">AI Feedback</h3>
      <div className="space-y-2">
        {feedback.map((item, index) => (
          <p key={index} className="text-sm text-muted-foreground">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}