import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import type { Message } from "@/hooks/useConversation";

interface ConversationTranscriptProps {
  messages: Message[];
  onViewDetails: (message: Message) => void;
}

export function ConversationTranscript({ messages, onViewDetails }: ConversationTranscriptProps) {
  const handlePlayAudio = (audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Conversation Transcript</h3>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2"
            onClick={() => {
              messages.forEach((message, index) => {
                if (message.audio_url) {
                  setTimeout(() => {
                    handlePlayAudio(message.audio_url);
                  }, index * 3000);
                }
              });
            }}
          >
            <Play className="h-4 w-4" />
            Play Full Conversation
          </Button>
        </div>
        <ScrollArea className="h-[400px] pr-4">
          <div className="flex-1 relative space-y-4">
            <ChatMessages
              messages={messages}
              onPlayAudio={handlePlayAudio}
              onShowScore={onViewDetails}
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}