import { useState } from 'react';

// Global set to track TTS generation across component instances
const ttsInProgressIds = new Set<string>();

export function useTTSState() {
  const [processingTTS, setProcessingTTS] = useState<Set<string>>(new Set());

  const isGeneratingTTS = (messageId: string) => {
    return ttsInProgressIds.has(messageId);
  };

  const startTTSGeneration = (messageId: string) => {
    ttsInProgressIds.add(messageId);
    setProcessingTTS(prev => new Set([...prev, messageId]));
  };

  const finishTTSGeneration = (messageId: string) => {
    ttsInProgressIds.delete(messageId);
    setProcessingTTS(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });
  };

  return {
    processingTTS,
    isGeneratingTTS,
    startTTSGeneration,
    finishTTSGeneration
  };
}