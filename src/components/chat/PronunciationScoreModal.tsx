import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PronunciationScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function PronunciationScoreModal({ isOpen, onClose, data }: PronunciationScoreModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="pronunciation-feedback">
        <DialogHeader>
          <DialogTitle>Pronunciation Feedback</DialogTitle>
          <DialogDescription id="pronunciation-feedback">
            Detailed analysis of your pronunciation
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <h3>Score: {data.score}</h3>
            <p>{data.feedback}</p>
          </div>
          <div>
            <h4>Suggestions:</h4>
            <ul>
              {data.suggestions.map((suggestion: string, index: number) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
