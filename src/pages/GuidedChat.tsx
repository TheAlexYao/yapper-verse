import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { RecommendedResponses } from "@/components/chat/RecommendedResponses";
import { PronunciationModal } from "@/components/chat/PronunciationModal";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  translation?: string;
  transliteration?: string;
  pronunciationScore?: number;
  isUser: boolean;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    text: "Bonjour! Que puis-je vous servir aujourd'hui?",
    translation: "Hello! What can I get you today?",
    transliteration: "bohn-ZHOOR! kuh PWEE-zhuh voo sair-VEER oh-zhoor-DWEE?",
    isUser: false,
  },
];

const MOCK_RESPONSES = [
  {
    id: "1",
    text: "Je voudrais un café, s'il vous plaît.",
    translation: "I would like a coffee, please.",
    hint: "This is a polite, formal way to order",
  },
  {
    id: "2",
    text: "Un café.",
    translation: "A coffee.",
    hint: "This is more casual/informal",
  },
  {
    id: "3",
    text: "Pourriez-vous me recommander votre meilleur café?",
    translation: "Could you recommend your best coffee?",
    hint: "This shows cultural interest and politeness",
  },
];

export default function GuidedChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [metrics, setMetrics] = useState({
    pronunciationScore: 85,
    stylePoints: 120,
    progress: 30,
    sentencesUsed: 1,
    sentenceLimit: 10,
  });

  const handleResponseSelect = (response: any) => {
    setSelectedResponse(response);
    setShowPronunciationModal(true);
  };

  const handlePronunciationComplete = (score: number) => {
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        text: selectedResponse.text,
        translation: selectedResponse.translation,
        pronunciationScore: score,
        isUser: true,
      },
    ]);
    setMetrics({
      ...metrics,
      pronunciationScore: Math.round((metrics.pronunciationScore + score) / 2),
      sentencesUsed: metrics.sentencesUsed + 1,
    });
    setSelectedResponse(null);
    setShowPronunciationModal(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background to-accent/20">
      <ChatHeader
        scenario={{ title: "Ordering Coffee at a Parisian Café" }}
        character={{
          name: "Marie",
          avatar: "/placeholder.svg",
        }}
        onBack={() => navigate("/character")}
      />

      {/* Messages Area with proper padding */}
      <ScrollArea className="flex-1 pt-24 pb-[220px] md:pb-[180px]">
        <div className="container max-w-2xl mx-auto px-4">
          {messages.map((message: Message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.isUser}
              onPlayAudio={!message.isUser ? () => {} : undefined}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Fixed Response Section */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="bg-background/95 backdrop-blur-sm rounded-t-lg border-t">
            {/* Score Bar */}
            <div className="flex items-center justify-center space-x-6 p-3 border-b text-sm">
              <div className="flex items-center">
                <span className="mr-2">🎯</span>
                <span className="font-medium">{metrics.pronunciationScore}%</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">⭐️</span>
                <span className="font-medium">{metrics.stylePoints}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📝</span>
                <span className="font-medium">{metrics.sentencesUsed}/{metrics.sentenceLimit}</span>
              </div>
            </div>
            
            <RecommendedResponses
              responses={MOCK_RESPONSES}
              onSelectResponse={handleResponseSelect}
            />
          </div>
        </div>
      </div>

      {selectedResponse && (
        <PronunciationModal
          isOpen={showPronunciationModal}
          onClose={() => setShowPronunciationModal(false)}
          response={selectedResponse}
          onSubmit={handlePronunciationComplete}
        />
      )}
    </div>
  );
}