import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConversationTranscript } from "@/components/feedback/ConversationTranscript";
import { PronunciationModal } from "@/components/feedback/PronunciationModal";
import { ScenarioSummary } from "@/components/feedback/ScenarioSummary";
import type { Message } from "@/hooks/useConversation";

export default function ScenarioFeedback() {
  const navigate = useNavigate();
  const [selectedUtterance, setSelectedUtterance] = useState<any>(null);

  // Mock data for demonstration
  const scenarioData = {
    title: "Ordering Coffee at a Parisian Café",
    completedAt: new Date().toLocaleString(),
    goal: "Successfully order a coffee in French",
    goalAchieved: true,
    character: {
      name: "Marie",
      description: "A friendly barista who uses casual, welcoming language and local slang",
      avatar: "/placeholder.svg"
    },
    metrics: {
      pronunciation: 85,
      style: 92,
      formality: "Casual and friendly"
    },
    conversation: [
      {
        id: "1",
        conversation_id: "mock-conv-1",
        isUser: false,
        text: "Bonjour! Que puis-je vous servir aujourd'hui?",
        translation: "Hello! What can I get you today?",
        audio_url: "/audio/barista-greeting.mp3",
        pronunciation_score: undefined,
        pronunciation_data: undefined,
      },
      {
        id: "2",
        conversation_id: "mock-conv-1",
        isUser: true,
        text: "Je voudrais un café, s'il vous plaît.",
        translation: "I would like a coffee, please.",
        audio_url: "/audio/user-response.mp3",
        pronunciation_score: 89,
        pronunciation_data: {
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
                }
              },
              {
                Word: "voudrais",
                PronunciationAssessment: {
                  AccuracyScore: 88,
                  ErrorType: "None",
                }
              },
              {
                Word: "un",
                PronunciationAssessment: {
                  AccuracyScore: 98,
                  ErrorType: "None",
                }
              },
              {
                Word: "café",
                PronunciationAssessment: {
                  AccuracyScore: 94,
                  ErrorType: "None",
                }
              },
              {
                Word: "s'il",
                PronunciationAssessment: {
                  AccuracyScore: 85,
                  ErrorType: "None",
                }
              },
              {
                Word: "vous",
                PronunciationAssessment: {
                  AccuracyScore: 92,
                  ErrorType: "None",
                }
              },
              {
                Word: "plaît",
                PronunciationAssessment: {
                  AccuracyScore: 87,
                  ErrorType: "None",
                }
              }
            ],
            AudioUrl: "/audio/user-response.mp3",
            OriginalAudioUrl: "/audio/native-speaker.mp3"
          }]
        }
      }
    ] as Message[],
    tips: [
      "Focus on longer vowel sounds in words like 'café'",
      "Try incorporating more local phrases next time",
      "Your formal expressions were well-used"
    ],
    suggestedScenarios: [
      {
        title: "Ordering Pastries",
        description: "Practice more food-related vocabulary"
      },
      {
        title: "Morning Greetings",
        description: "Master common French greetings"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate("/scenarios")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold">{scenarioData.title}</h1>
          </div>
          <div className="w-[72px]" />
        </div>

        {/* Quick Summary */}
        <ScenarioSummary
          title={scenarioData.title}
          completedAt={scenarioData.completedAt}
          metrics={scenarioData.metrics}
          goalAchieved={scenarioData.goalAchieved}
        />

        {/* Conversation Review */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Conversation Review</h2>
          <ConversationTranscript
            messages={scenarioData.conversation}
            onViewDetails={(message) => {
              if (message.pronunciation_data?.NBest?.[0]) {
                const assessment = message.pronunciation_data.NBest[0].PronunciationAssessment;
                setSelectedUtterance({
                  text: message.text,
                  metrics: {
                    accuracy: assessment.AccuracyScore,
                    fluency: assessment.FluencyScore,
                    completeness: assessment.CompletenessScore,
                    overall: assessment.PronScore,
                  },
                  words: message.pronunciation_data.NBest[0].Words.map(w => ({
                    word: w.Word,
                    score: w.PronunciationAssessment.AccuracyScore,
                    phonetic: "", // Add if available
                  })),
                });
              }
            }}
          />
        </div>

        {/* Key Takeaways */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">What You Did Well</h3>
              <ul className="space-y-2">
                {scenarioData.tips
                  .filter(tip => tip.includes("well") || tip.includes("good"))
                  .map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Areas to Practice</h3>
              <ul className="space-y-2">
                {scenarioData.tips
                  .filter(tip => !tip.includes("well") && !tip.includes("good"))
                  .map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Recommended Next Steps</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {scenarioData.suggestedScenarios.map((scenario, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 justify-start bg-gradient-to-r from-background to-accent/5 hover:to-accent/10"
                  onClick={() => navigate("/scenarios")}
                >
                  <div className="text-left">
                    <h4 className="font-medium mb-1">{scenario.title}</h4>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-end">
          <Button
            className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white hover:opacity-90"
            onClick={() => navigate("/scenarios")}
          >
            Try Another Scenario
          </Button>
        </div>

        {/* Pronunciation Modal */}
        {selectedUtterance && (
          <PronunciationModal
            isOpen={!!selectedUtterance}
            onClose={() => setSelectedUtterance(null)}
            utterance={selectedUtterance}
          />
        )}
      </div>
    </div>
  );
}