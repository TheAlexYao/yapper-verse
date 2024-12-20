import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">Conversation Transcript</h3>
        <ScrollArea className="h-[400px] pr-4">
          <div className="flex-1 relative">
            <ChatMessages
              messages={messages}
              onPlayAudio={() => {}}
              renderMessageActions={(message) =>
                message.isUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-xs"
                    onClick={() => onViewDetails(message)}
                  >
                    View Details
                  </Button>
                )
              }
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}