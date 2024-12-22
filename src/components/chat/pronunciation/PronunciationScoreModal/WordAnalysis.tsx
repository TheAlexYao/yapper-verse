import { AudioWaveform } from "lucide-react";
import { cn } from "@/lib/utils";

interface Word {
  Word: string;
  PronunciationAssessment: {
    AccuracyScore: number;
    ErrorType?: string;
  };
}

interface WordAnalysisProps {
  words: Word[];
}

export function WordAnalysis({ words }: WordAnalysisProps) {
  const getScoreBgClass = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 75) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AudioWaveform className="h-5 w-5 text-[#7843e6]" />
        Word-by-Word Analysis
      </h3>
      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#7843e6]/20 scrollbar-track-[#7843e6]/5">
        {words.map((word, index) => (
          <div
            key={`${word.Word}-${index}`}
            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#9b87f5]/5 to-[#7843e6]/5 border border-[#9b87f5]/20 hover:from-[#9b87f5]/10 hover:to-[#7843e6]/10 transition-colors"
          >
            <span className="font-medium">{word.Word}</span>
            <span
              className={cn(
                "text-sm font-medium px-3 py-1 rounded-full border",
                getScoreBgClass(word.PronunciationAssessment.AccuracyScore)
              )}
            >
              {word.PronunciationAssessment.AccuracyScore.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}