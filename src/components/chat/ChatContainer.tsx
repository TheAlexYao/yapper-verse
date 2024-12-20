import { useState } from "react";
import { ChatMessages } from "./ChatMessages";
import { RecommendedResponses } from "./RecommendedResponses";
import { ChatMetrics } from "./ChatMetrics";
import { PronunciationModal } from "./PronunciationModal";
import type { Message } from "@/hooks/useConversation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@supabase/auth-helpers-react";

interface ChatContainerProps {
  messages: Message[];
  onMessageSend: (message: Message) => void;
  onPlayTTS: () => void;
  conversationId: string;
}

export function ChatContainer({ messages, onMessageSend, onPlayTTS, conversationId }: ChatContainerProps) {
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const auth = useAuth();

  const handleResponseSelect = (response: any) => {
    setSelectedResponse(response);
    setShowPronunciationModal(true);
  };

  const handlePronunciationComplete = async (score: number, audioUrl?: string) => {
    if (!auth.user?.id) return;

    const newMessage = {
      conversation_id: conversationId,
      content: selectedResponse.text,
      translation: selectedResponse.translation,
      pronunciation_score: score,
      pronunciation_data: selectedResponse.pronunciationData,
      audio_url: audioUrl,
      is_user: true,
    };
    
    const { error } = await supabase
      .from('guided_conversation_messages')
      .insert(newMessage);

    if (error) {
      console.error('Error saving message:', error);
      return;
    }

    // Update conversation metrics
    const { error: metricsError } = await supabase
      .from('guided_conversations')
      .update({
        metrics: {
          pronunciationScore: score,
          sentencesUsed: messages.filter(m => m.is_user).length + 1,
          sentenceLimit: 10
        }
      })
      .eq('id', conversationId);

    if (metricsError) {
      console.error('Error updating metrics:', metricsError);
    }

    onMessageSend(newMessage as Message);
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
            pronunciationScore={messages.reduce((acc, msg) => msg.pronunciation_score ? acc + msg.pronunciation_score : acc, 0) / messages.filter(m => m.pronunciation_score).length || 0}
            stylePoints={120}
            sentencesUsed={messages.filter(m => m.is_user).length}
            sentenceLimit={10}
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