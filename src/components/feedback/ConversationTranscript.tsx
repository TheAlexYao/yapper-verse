import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface Message {
  id: string;
  text: string;
  translation?: string;
  transliteration?: string;
  pronunciationScore?: number;
  pronunciationData?: any;
  audioUrl?: string;
  isUser: boolean;
}

interface ConversationTranscriptProps {
  messages: Message[];
  onViewDetails: (message: Message) => void;
}

export function ConversationTranscript({ messages, onViewDetails }: ConversationTranscriptProps) {
  const messagesWithActions = messages.map(message => ({
    ...message,
    actions: message.isUser ? (
      <Button
        variant="secondary"
        size="sm"
        className="gap-2"
        onClick={() => onViewDetails(message)}
      >
        <Eye className="h-4 w-4" />
        Details
      </Button>
    ) : null
  }));

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Conversation Transcript</h3>
        <ScrollArea className="h-[400px] pr-4">
          <div className="flex-1 relative space-y-4">
            <ChatMessages
              messages={messagesWithActions}
              onPlayAudio={() => {}}
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}