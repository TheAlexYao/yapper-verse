import { useState, useRef, useEffect } from "react";
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
  const viewportRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({
    pronunciationScore: 85,
    stylePoints: 120,
    progress: 30,
    sentencesUsed: 1,
    sentenceLimit: 10,
  });

  const scrollToBottom = () => {
    if (viewportRef.current) {
      const viewport = viewportRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = () => {
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: "Excellent! Je vous prépare votre café tout de suite.",
        translation: "Excellent! I'll prepare your coffee right away.",
        transliteration: "eks-say-LAHN! zhuh voo pray-PAHR vot-ruh kah-FAY too duh SWEET.",
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
      scrollToBottom(); // Add scroll after AI response
    }, 1500);
  };

  const handleResponseSelect = (response: any) => {
    setSelectedResponse(response);
    setShowPronunciationModal(true);
  };

  const handlePronunciationComplete = (score: number) => {
    const newMessage = {
      id: Date.now().toString(),
      text: selectedResponse.text,
      translation: selectedResponse.translation,
      pronunciationScore: score,
      isUser: true,
    };
    
    setMessages(prev => [...prev, newMessage]);
    scrollToBottom(); // Add scroll after user message
    setMetrics({
      ...metrics,
      pronunciationScore: Math.round((metrics.pronunciationScore + score) / 2),
      sentencesUsed: metrics.sentencesUsed + 1,
    });
    setSelectedResponse(null);
    setShowPronunciationModal(false);
    
    simulateAIResponse();
  };

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader
        scenario={{ title: "Ordering Coffee at a Parisian Café" }}
        character={{
          name: "Marie",
          avatar: "/placeholder.svg",
        }}
        onBack={() => navigate("/character")}
      />

      <div className="flex-1 relative">
        <ScrollArea className="absolute inset-0" viewportRef={viewportRef}>
          <div className="container max-w-2xl mx-auto px-4 pt-16 pb-[calc(2rem+180px)]">
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
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm">
        <div className="container max-w-2xl mx-auto px-4">
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
