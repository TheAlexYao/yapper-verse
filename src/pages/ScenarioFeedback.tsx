import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Info, Volume2, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ConversationTranscript } from "@/components/feedback/ConversationTranscript";

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  utterance: {
    text: string;
    metrics: {
      accuracy: number;
      fluency: number;
      completeness: number;
      overall: number;
    };
    words: Array<{
      word: string;
      score: number;
      phonetic: string;
    }>;
    improvementTip?: string;
  };
}

function PronunciationModal({ isOpen, onClose, utterance }: PronunciationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pronunciation Analysis</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-lg font-medium">{utterance.text}</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Accuracy</span>
                <span>{utterance.metrics.accuracy}%</span>
              </div>
              <Progress value={utterance.metrics.accuracy} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Fluency</span>
                <span>{utterance.metrics.fluency}%</span>
              </div>
              <Progress value={utterance.metrics.fluency} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Completeness</span>
                <span>{utterance.metrics.completeness}%</span>
              </div>
              <Progress value={utterance.metrics.completeness} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall</span>
                <span>{utterance.metrics.overall}%</span>
              </div>
              <Progress value={utterance.metrics.overall} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Word-by-Word Analysis</h4>
            <div className="space-y-2">
              {utterance.words.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{word.word}</p>
                    <p className="text-sm text-muted-foreground">{word.phonetic}</p>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    word.score >= 90 ? "text-green-600" :
                    word.score >= 75 ? "text-yellow-600" :
                    "text-red-600"
                  )}>
                    {word.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {utterance.improvementTip && (
            <div className="p-4 rounded-lg bg-accent/50">
              <h4 className="font-medium mb-2">Improvement Tip</h4>
              <p className="text-sm text-muted-foreground">{utterance.improvementTip}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const audio = new Audio("/native-speaker-audio.mp3");
                audio.play();
              }}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Listen to Native Speaker
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
        isUser: false,
        text: "Bonjour! Que puis-je vous servir aujourd'hui?",
        translation: "Hello! What can I get you today?",
        audioUrl: "/audio/barista-greeting.mp3" // Mock audio URL
      },
      {
        id: "2",
        isUser: true,
        text: "Je voudrais un café, s'il vous plaît.",
        translation: "I would like a coffee, please.",
        audioUrl: "/audio/user-response.mp3", // Mock audio URL
        pronunciationScore: 89,
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
    ],
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
        {/* Header - Simplified */}
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
          <div className="w-[72px]" /> {/* Spacer for alignment */}
        </div>

        {/* Quick Summary - Most important info first */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-[#9b87f5]/10 to-[#7843e6]/10 border border-accent/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">Overall Performance</h2>
              <p className="text-sm text-muted-foreground">{scenarioData.completedAt}</p>
            </div>
            {scenarioData.goalAchieved && (
              <div className="flex items-center gap-2 text-[#7843e6]">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Goal Achieved</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-[#7843e6] mb-1">
                {scenarioData.metrics.pronunciation}%
              </div>
              <div className="text-sm text-muted-foreground">Pronunciation</div>
            </div>
            <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-[#7843e6] mb-1">
                {scenarioData.metrics.style}%
              </div>
              <div className="text-sm text-muted-foreground">Style</div>
            </div>
            <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
              <div className="text-sm font-medium mb-1">{scenarioData.metrics.formality}</div>
              <div className="text-sm text-muted-foreground">Tone</div>
            </div>
          </div>
        </div>

        {/* Conversation Review - Focus on learning */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Conversation Review</h2>
          <ConversationTranscript
            messages={scenarioData.conversation}
            onViewDetails={(utterance) => {
              setSelectedUtterance({
                text: utterance.text,
                metrics: {
                  accuracy: utterance.pronunciationData?.NBest[0].PronunciationAssessment.AccuracyScore || 0,
                  fluency: utterance.pronunciationData?.NBest[0].PronunciationAssessment.FluencyScore || 0,
                  completeness: utterance.pronunciationData?.NBest[0].PronunciationAssessment.CompletenessScore || 0,
                  overall: utterance.pronunciationData?.NBest[0].PronunciationAssessment.PronScore || 0,
                },
                words: utterance.pronunciationData?.NBest[0].Words.map(w => ({
                  word: w.Word,
                  score: w.PronunciationAssessment.AccuracyScore,
                  phonetic: "", // Add if available
                })) || [],
              });
            }}
          />
        </div>

        {/* Key Takeaways - Actionable feedback */}
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

        {/* Footer - Simplified */}
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
