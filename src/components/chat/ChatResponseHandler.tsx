import { useState } from "react";
import { RecommendedResponses } from "./RecommendedResponses";
import { PronunciationModal } from "./PronunciationModal";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/hooks/useConversation";

interface ChatResponseHandlerProps {
  onMessageSend: (message: Message) => void;
  conversationId: string;
}

export function ChatResponseHandler({ onMessageSend, conversationId }: ChatResponseHandlerProps) {
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);

  const handleResponseSelect = (response: any) => {
    setSelectedResponse(response);
    setShowPronunciationModal(true);
  };

  const handlePronunciationComplete = async (score: number, audioUrl?: string) => {
    if (!selectedResponse) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      text: selectedResponse.text,
      translation: selectedResponse.translation,
      pronunciation_score: score,
      pronunciation_data: selectedResponse.pronunciationData,
      audio_url: audioUrl,
      isUser: true,
    };

    // Update conversation metrics
    const { error: metricsError } = await supabase
      .from('guided_conversations')
      .update({
        metrics: {
          pronunciationScore: score,
          sentencesUsed: 1,
          sentenceLimit: 10
        }
      })
      .eq('id', conversationId);

    if (metricsError) {
      console.error('Error updating metrics:', metricsError);
    }

    onMessageSend(newMessage);
    setSelectedResponse(null);
    setShowPronunciationModal(false);
  };

  return (
    <>
      <RecommendedResponses
        responses={MOCK_RESPONSES}
        onSelectResponse={handleResponseSelect}
      />

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
