import { useState } from 'react';

interface Response {
  text: string;
  translation: string;
  audio_url?: string;
  languageCode?: string;
}

export function useResponseState() {
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioGenerationStatus, setAudioGenerationStatus] = useState<'idle' | 'generating' | 'complete' | 'error'>('idle');

  console.log('useResponseState - Current processing state:', isProcessing);
  console.log('useResponseState - Audio generation status:', audioGenerationStatus);
  console.log('useResponseState - Selected response:', selectedResponse);

  const handleResponseSelect = async (response: Response) => {
    console.log('handleResponseSelect - Starting with response:', response);
    setSelectedResponse(response);
    setIsProcessing(false); // Reset processing state when selecting new response
    setAudioGenerationStatus('idle');
  };

  const startProcessing = () => {
    console.log('startProcessing - Setting processing to true');
    setIsProcessing(true);
  };

  const stopProcessing = () => {
    console.log('stopProcessing - Setting processing to false');
    setIsProcessing(false);
  };

  const startAudioGeneration = () => {
    console.log('startAudioGeneration - Setting status to generating');
    setAudioGenerationStatus('generating');
  };

  const completeAudioGeneration = () => {
    console.log('completeAudioGeneration - Setting status to complete');
    setAudioGenerationStatus('complete');
  };

  const resetState = () => {
    console.log('resetState - Resetting all states');
    setSelectedResponse(null);
    setIsProcessing(false);
    setAudioGenerationStatus('idle');
  };

  return {
    selectedResponse,
    isProcessing,
    audioGenerationStatus,
    setIsProcessing,
    handleResponseSelect,
    startProcessing,
    stopProcessing,
    startAudioGeneration,
    completeAudioGeneration,
    resetState,
  };
}