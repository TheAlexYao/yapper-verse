/**
 * PronunciationScoreModal Component
 * 
 * Displays detailed pronunciation assessment results including:
 * 1. Audio comparison between user and reference recordings
 * 2. AI-generated feedback based on assessment
 * 3. Overall pronunciation metrics and scores
 * 4. Word-by-word pronunciation analysis
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Volume2, AudioWaveform, Star, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PronunciationData {
  NBest?: Array<{
    PronunciationAssessment?: {
      AccuracyScore: number;
      FluencyScore: number;
      CompletenessScore: number;
      PronScore: number;
    };
    Words?: Array<{
      Word: string;
      PronunciationAssessment: {
        AccuracyScore: number;
        ErrorType: string;
      };
    }>;
  }>;
}

interface PronunciationScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PronunciationData;
  userAudioUrl?: string;
  referenceAudioUrl?: string;
}

export function PronunciationScoreModal({
  isOpen,
  onClose,
  data,
  userAudioUrl,
  referenceAudioUrl
}: PronunciationScoreModalProps) {
  const assessment = data.NBest?.[0]?.PronunciationAssessment;
  const words = data.NBest?.[0]?.Words || [];

  const handlePlayAudio = async (audioUrl?: string) => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    await audio.play();
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgClass = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 75) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Pronunciation Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Audio Comparison Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AudioWaveform className="h-5 w-5 text-primary" />
              Compare Audio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userAudioUrl && (
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-primary hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => handlePlayAudio(userAudioUrl)}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Your Recording
                </Button>
              )}
              {referenceAudioUrl && (
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-accent hover:bg-accent/10 hover:text-accent transition-colors"
                  onClick={() => handlePlayAudio(referenceAudioUrl)}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Reference Audio
                </Button>
              )}
            </div>
          </section>

          {/* Overall Score Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Overall Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Score</span>
                  <span className={cn(
                    "text-3xl font-bold",
                    getScoreColorClass(assessment?.PronScore || 0)
                  )}>
                    {assessment?.PronScore.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={assessment?.PronScore} 
                  className={cn(
                    "h-3",
                    assessment?.PronScore && assessment.PronScore >= 90 ? "bg-green-200" : 
                    assessment?.PronScore && assessment.PronScore >= 75 ? "bg-yellow-200" : "bg-red-200"
                  )} 
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy</span>
                    <span className={getScoreColorClass(assessment?.AccuracyScore || 0)}>
                      {assessment?.AccuracyScore.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={assessment?.AccuracyScore} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Fluency</span>
                    <span className={getScoreColorClass(assessment?.FluencyScore || 0)}>
                      {assessment?.FluencyScore.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={assessment?.FluencyScore} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Completeness</span>
                    <span className={getScoreColorClass(assessment?.CompletenessScore || 0)}>
                      {assessment?.CompletenessScore.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={assessment?.CompletenessScore} className="h-2" />
                </div>
              </div>
            </div>
          </section>

          {/* AI Feedback Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Feedback
            </h3>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                {assessment?.PronScore && assessment.PronScore >= 90
                  ? "Excellent pronunciation! Keep up the great work."
                  : assessment?.PronScore && assessment.PronScore >= 75
                  ? "Good pronunciation with room for improvement."
                  : "Continue practicing to improve your pronunciation."}
              </p>
            </div>
          </section>

          {/* Word Analysis Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AudioWaveform className="h-5 w-5 text-primary" />
              Word-by-Word Analysis
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {words.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors"
                >
                  <span className="font-medium">{word.Word}</span>
                  <span className={cn(
                    "text-sm font-medium px-3 py-1 rounded-full border",
                    getScoreBgClass(word.PronunciationAssessment.AccuracyScore)
                  )}>
                    {word.PronunciationAssessment.AccuracyScore.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}