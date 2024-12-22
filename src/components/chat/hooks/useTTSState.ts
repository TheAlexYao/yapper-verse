import { useState } from 'react';

// Set to track messages currently being processed
const processingMessages = new Set<string>();

export function useTTSState() {
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  const isGeneratingTTS = (messageId: string) => {
    return processingMessages.has(messageId);
  };

  const startTTSGeneration = (messageId: string) => {
    processingMessages.add(messageId);
    setProcessing(new Set(processingMessages));
  };

  const finishTTSGeneration = (messageId: string) => {
    processingMessages.delete(messageId);
    setProcessing(new Set(processingMessages));
  };

  return {
    processingTTS: processing,
    isGeneratingTTS,
    startTTSGeneration,
    finishTTSGeneration
  };
}