import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Volume2, AudioWaveform } from "lucide-react";

interface PronunciationScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
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
  const handlePlayAudio = async (audioUrl: string) => {
    if (!audioUrl) return;
    try {
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Pronunciation Score</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            {/* Audio Comparison Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AudioWaveform className="h-5 w-5" />
                Compare Audio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userAudioUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePlayAudio(userAudioUrl)}
                    className="flex-1 border-2 border-primary hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Volume2 className="mr-2 h-4 w-4" />
                    Your Audio
                  </Button>
                )}
                {referenceAudioUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePlayAudio(referenceAudioUrl)}
                    className="flex-1 border-2 border-accent hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    <Volume2 className="mr-2 h-4 w-4" />
                    Reference Audio
                  </Button>
                )}
              </div>
            </section>

            {/* AI Feedback Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">AI Feedback</h3>
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  {data.NBest?.[0]?.PronunciationAssessment?.PronScore >= 90
                    ? "Excellent pronunciation! Keep up the great work."
                    : data.NBest?.[0]?.PronunciationAssessment?.PronScore >= 75
                    ? "Good pronunciation with room for improvement."
                    : "Continue practicing to improve your pronunciation."}
                </p>
              </div>
            </section>

            {/* Overall Scores Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Overall Scores</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall Score:</span>
                  <span className="text-2xl font-bold">{data.NBest?.[0]?.PronunciationAssessment?.PronScore || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Accuracy:</span>
                  <span>{data.NBest?.[0]?.PronunciationAssessment?.AccuracyScore || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fluency:</span>
                  <span>{data.NBest?.[0]?.PronunciationAssessment?.FluencyScore || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completeness:</span>
                  <span>{data.NBest?.[0]?.PronunciationAssessment?.CompletenessScore || 0}</span>
                </div>
              </div>
            </section>

            {/* Word Analysis Section */}
            {data.NBest?.[0]?.Words && (
              <section className="space-y-4">
                <h3 className="text-lg font-semibold">Word Analysis</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {data.NBest[0].Words.map((word: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors"
                    >
                      <span className="font-medium">{word.Word}</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        word.PronunciationAssessment?.AccuracyScore >= 90 
                          ? "bg-green-100 text-green-700" 
                          : word.PronunciationAssessment?.AccuracyScore >= 75 
                          ? "bg-yellow-100 text-yellow-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {word.PronunciationAssessment?.AccuracyScore || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}