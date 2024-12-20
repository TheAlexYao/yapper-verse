import { useState } from "react";
import { ChatMessages } from "./ChatMessages";
import { RecommendedResponses } from "./RecommendedResponses";
import { ChatMetrics } from "./ChatMetrics";
import { PronunciationModal } from "./PronunciationModal";
import type { Message } from "@/hooks/useConversation";

interface ChatContainerProps {
  messages: Message[];
  onMessageSend: (message: Message) => void;
  onPlayTTS: () => void;
}

export function ChatContainer({ messages, onMessageSend, onPlayTTS }: ChatContainerProps) {
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

  const handlePronunciationComplete = (score: number, audioUrl?: string) => {
    const newMessage = {
      id: Date.now().toString(),
      text: selectedResponse.text,
      translation: selectedResponse.translation,
      pronunciationScore: score,
      pronunciationData: selectedResponse.pronunciationData,
      audioUrl,
      isUser: true,
    };
    
    onMessageSend(newMessage);
    setMetrics({
      ...metrics,
      pronunciationScore: Math.round((metrics.pronunciationScore + score) / 2),
      sentencesUsed: metrics.sentencesUsed + 1,
    });
    setSelectedResponse(null);
    setShowPronunciationModal(false);
  };

  return (
    <>
      <div className="flex-1 relative">
        <ChatMessages messages={messages} onPlayAudio={onPlayTTS} />
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
    </>
  );
}

// Mock data (will be replaced with real data from the API)
const MOCK_RESPONSES = [
  {
    id: "1",
    text: "Je voudrais un café, s'il vous plaît.",
    translation: "I would like a coffee, please.",
    hint: "This is a polite, formal way to order",
    pronunciationData: {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: 92,
          FluencyScore: 88,
          CompletenessScore: 95,
          PronScore: 91,
        },
        Words: [
          {
            Word: "Je",
            PronunciationAssessment: {
              AccuracyScore: 95,
              ErrorType: "None",
            },
          },
          {
            Word: "voudrais",
            PronunciationAssessment: {
              AccuracyScore: 88,
              ErrorType: "None",
            },
          },
          {
            Word: "un",
            PronunciationAssessment: {
              AccuracyScore: 98,
              ErrorType: "None",
            },
          },
          {
            Word: "café",
            PronunciationAssessment: {
              AccuracyScore: 94,
              ErrorType: "None",
            },
          },
          {
            Word: "s'il",
            PronunciationAssessment: {
              AccuracyScore: 85,
              ErrorType: "None",
            },
          },
          {
            Word: "vous",
            PronunciationAssessment: {
              AccuracyScore: 92,
              ErrorType: "None",
            },
          },
          {
            Word: "plaît",
            PronunciationAssessment: {
              AccuracyScore: 87,
              ErrorType: "None",
            },
          },
        ],
      }],
    },
  },
  {
    id: "2",
    text: "Un café.",
    translation: "A coffee.",
    hint: "This is more casual/informal",
    pronunciationData: {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: 85,
          FluencyScore: 90,
          CompletenessScore: 100,
          PronScore: 92,
        },
        Words: [
          {
            Word: "Un",
            PronunciationAssessment: {
              AccuracyScore: 95,
              ErrorType: "None",
            },
          },
          {
            Word: "café",
            PronunciationAssessment: {
              AccuracyScore: 75,
              ErrorType: "None",
            },
          },
        ],
      }],
    },
  },
  {
    id: "3",
    text: "Pourriez-vous me recommander votre meilleur café?",
    translation: "Could you recommend your best coffee?",
    hint: "This shows cultural interest and politeness",
    pronunciationData: {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: 78,
          FluencyScore: 82,
          CompletenessScore: 90,
          PronScore: 83,
        },
        Words: [
          {
            Word: "Pourriez",
            PronunciationAssessment: {
              AccuracyScore: 72,
              ErrorType: "None",
            },
          },
          {
            Word: "vous",
            PronunciationAssessment: {
              AccuracyScore: 88,
              ErrorType: "None",
            },
          },
          {
            Word: "me",
            PronunciationAssessment: {
              AccuracyScore: 95,
              ErrorType: "None",
            },
          },
          {
            Word: "recommander",
            PronunciationAssessment: {
              AccuracyScore: 68,
              ErrorType: "None",
            },
          },
          {
            Word: "votre",
            PronunciationAssessment: {
              AccuracyScore: 85,
              ErrorType: "None",
            },
          },
          {
            Word: "meilleur",
            PronunciationAssessment: {
              AccuracyScore: 70,
              ErrorType: "None",
            },
          },
          {
            Word: "café",
            PronunciationAssessment: {
              AccuracyScore: 92,
              ErrorType: "None",
            },
          },
        ],
      }],
    },
  },
];
