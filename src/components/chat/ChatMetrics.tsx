interface ChatMetricsProps {
  pronunciationScore: number;
  stylePoints: number;
  sentencesUsed: number;
  sentenceLimit: number;
}

export function ChatMetrics({ pronunciationScore, stylePoints, sentencesUsed, sentenceLimit }: ChatMetricsProps) {
  return (
    <div className="flex items-center justify-center space-x-6 p-3 border-b text-sm">
      <div className="flex items-center">
        <span className="mr-2">🎯</span>
        <span className="font-medium">{pronunciationScore}%</span>
      </div>
      <div className="flex items-center">
        <span className="mr-2">⭐️</span>
        <span className="font-medium">{stylePoints}</span>
      </div>
      <div className="flex items-center">
        <span className="mr-2">📝</span>
        <span className="font-medium">{sentencesUsed}/{sentenceLimit}</span>
      </div>
    </div>
  );
}