import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Info, Volume2, ExternalLink } from "lucide-react";
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate("/scenarios")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scenarios
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold">{scenarioData.title}</h1>
            <p className="text-sm text-muted-foreground">{scenarioData.completedAt}</p>
          </div>
        </div>

        {/* Goal & Character */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-medium mb-2">Scenario Goal</h3>
                  <p className="text-sm text-muted-foreground mb-4">{scenarioData.goal}</p>
                  {scenarioData.goalAchieved && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Goal Achieved</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                  <img
                    src={scenarioData.character.avatar}
                    alt={scenarioData.character.name}
                    className="h-8 w-8"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-2">{scenarioData.character.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {scenarioData.character.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Overall Performance</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Pronunciation</span>
                  <span>{scenarioData.metrics.pronunciation}%</span>
                </div>
                <Progress value={scenarioData.metrics.pronunciation} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Style</span>
                  <span>{scenarioData.metrics.style}%</span>
                </div>
                <Progress value={scenarioData.metrics.style} />
              </div>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{scenarioData.metrics.formality}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Improvement Tips</h3>
            <ul className="space-y-2">
              {scenarioData.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="select-none">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Conversation Transcript */}
        <div className="mb-8">
          <ConversationTranscript
            messages={scenarioData.conversation}
            onViewDetails={setSelectedUtterance}
          />
        </div>

        {/* Suggested Scenarios */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Suggested Next Scenarios</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {scenarioData.suggestedScenarios.map((scenario, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => navigate("/scenarios")}
                >
                  <div className="text-left">
                    <h4 className="font-medium mb-1">{scenario.title}</h4>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="space-x-4">
            <Button variant="link" className="text-sm" onClick={() => window.open("#", "_blank")}>
              Help/FAQ
            </Button>
            <Button variant="link" className="text-sm" onClick={() => window.open("#", "_blank")}>
              Terms
            </Button>
            <Button variant="link" className="text-sm" onClick={() => window.open("#", "_blank")}>
              Privacy
            </Button>
          </div>
          <Button
            className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white hover:opacity-90"
            onClick={() => navigate("/scenarios")}
          >
            Back to Scenarios
          </Button>
        </div>

        {selectedUtterance && (
          <PronunciationModal
            isOpen={!!selectedUtterance}
            onClose={() => setSelectedUtterance(null)}
            utterance={{
              text: selectedUtterance.text,
              metrics: {
                accuracy: selectedUtterance.metrics.accuracy,
                fluency: selectedUtterance.metrics.fluency,
                completeness: selectedUtterance.metrics.completeness,
                overall: selectedUtterance.metrics.overall,
              },
              words: selectedUtterance.metrics.words,
              improvementTip: selectedUtterance.metrics.improvementTip,
            }}
          />
        )}
      </div>
    </div>
  );
}
