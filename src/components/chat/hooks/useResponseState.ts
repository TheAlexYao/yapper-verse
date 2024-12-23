import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Message } from '@/hooks/useConversation';

export function useResponseState() {
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleResponseSelect = async (response: any) => {
    try {
      setSelectedResponse(response);
      setIsProcessing(true);
    } catch (error) {
      console.error('Error selecting response:', error);
      toast({
        title: "Error",
        description: "Failed to select response. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setSelectedResponse(null);
    setIsProcessing(false);
  };

  return {
    selectedResponse,
    isProcessing,
    handleResponseSelect,
    resetState,
  };
}