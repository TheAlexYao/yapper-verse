import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";

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
              // Play all messages in sequence
              messages.forEach((message, index) => {
                if (message.audioUrl) {
                  setTimeout(() => {
                    handlePlayAudio(message.audioUrl);
                  }, index * 3000); // 3 second delay between messages
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
              messages={messages.map(message => ({
                ...message,
                id: message.id,
                text: message.text,
                translation: message.translation,
                transliteration: message.transliteration,
                pronunciationScore: message.pronunciationScore,
                pronunciationData: message.pronunciationData,
                audioUrl: message.audioUrl,
                isUser: message.isUser
              }))}
              onPlayAudio={() => {}}
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}