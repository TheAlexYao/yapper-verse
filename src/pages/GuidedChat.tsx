import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { RecommendedResponses } from "@/components/chat/RecommendedResponses";
import { PronunciationModal } from "@/components/chat/PronunciationModal";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatMetrics } from "@/components/chat/ChatMetrics";

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

  const simulateAIResponse = () => {
    const aiResponse: Message = {
      id: Date.now().toString(),
      text: "Excellent! Je vous prépare votre café tout de suite.",
      translation: "Excellent! I'll prepare your coffee right away.",
      transliteration: "eks-say-LAHN! zhuh voo pray-PAHR vot-ruh kah-FAY too duh SWEET.",
      isUser: false,
    };
    
    // Update messages immediately instead of using setTimeout
    setMessages(prev => [...prev, aiResponse]);
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
        <ChatMessages messages={messages} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm">
        <div className="container max-w-2xl mx-auto px-4">
          <ChatMetrics
            pronunciationScore={metrics.pronunciationScore}
            stylePoints={metrics.stylePoints}
            sentencesUsed={metrics.sentencesUsed}
            sentenceLimit={metrics.sentenceLimit}
          />
          
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