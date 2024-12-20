import { ChatMetrics } from "./ChatMetrics";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";

interface ChatMetricsContainerProps {
  messages: Message[];
  conversationId: string;
}

export function ChatMetricsContainer({ messages, conversationId }: ChatMetricsContainerProps) {
  const pronunciationScore = messages.reduce((acc, msg) => 
    msg.pronunciation_score ? acc + msg.pronunciation_score : acc, 0
  ) / messages.filter(m => m.pronunciation_score).length || 0;

  const userMessages = messages.filter(m => m.isUser).length;

  return (
    <ChatMetrics
      pronunciationScore={pronunciationScore}
      stylePoints={120}
      sentencesUsed={userMessages}
      sentenceLimit={10}
    />
  );
}