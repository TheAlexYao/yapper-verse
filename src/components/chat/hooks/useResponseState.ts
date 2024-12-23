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

  console.log('useResponseState - Current processing state:', isProcessing);
  console.log('useResponseState - Selected response:', selectedResponse);

  const handleResponseSelect = async (response: Response) => {
    console.log('handleResponseSelect - Starting with response:', response);
    setSelectedResponse(response);
    setIsProcessing(false); // Reset processing state when selecting new response
  };

  const resetState = () => {
    console.log('resetState - Resetting state');
    setSelectedResponse(null);
    setIsProcessing(false);
  };

  return {
    selectedResponse,
    isProcessing,
    setIsProcessing,
    handleResponseSelect,
    resetState,
  };
}