import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pronunciation Score</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Score:</span>
              <span className="text-2xl font-bold">{data.NBest?.[0]?.PronunciationAssessment?.PronScore || 0}</span>
            </div>
            
            <div className="space-y-2">
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

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Audio Comparison</h4>
              <div className="flex gap-2">
                {userAudioUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePlayAudio(userAudioUrl)}
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Your Audio
                  </Button>
                )}
                {referenceAudioUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePlayAudio(referenceAudioUrl)}
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Reference Audio
                  </Button>
                )}
              </div>
            </div>

            {data.NBest?.[0]?.Words && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Word Analysis</h4>
                <div className="space-y-1">
                  {data.NBest[0].Words.map((word: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{word.Word}</span>
                      <span className={word.PronunciationAssessment?.AccuracyScore >= 80 ? "text-green-600" : "text-red-600"}>
                        {word.PronunciationAssessment?.AccuracyScore || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}