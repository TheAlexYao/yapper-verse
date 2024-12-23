import { PronunciationModal } from "./pronunciation/PronunciationModal";
import type { Message } from "@/hooks/useConversation";

interface PronunciationHandlerProps {
  selectedResponse: any;
  isProcessing: boolean;
  onClose: () => void;
  onSubmit: (score: number, audioBlob?: Blob) => Promise<void>;
}

export function PronunciationHandler({
  selectedResponse,
  isProcessing,
  onClose,
  onSubmit
}: PronunciationHandlerProps) {
  console.log('PronunciationHandler - isProcessing:', isProcessing);
  console.log('PronunciationHandler - selectedResponse:', selectedResponse);

  if (!selectedResponse) return null;

  return (
    <PronunciationModal
      isOpen={!!selectedResponse}
      onClose={onClose}
      response={selectedResponse}
      onSubmit={onSubmit}
      isProcessing={isProcessing}
    />
  );
}