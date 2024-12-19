import React from "react";
import { ArrowLeft, MessageCircle, Play, Mic, Speaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const GuidedChat = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = React.useState(0);
  const [pronunciationScore, setPronunciationScore] = React.useState(0);
  const [stylePoints, setStylePoints] = React.useState(0);
  const [sentencesUsed, setSentencesUsed] = React.useState(0);
  const maxSentences = 10;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/character")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Score: {pronunciationScore}%
            </div>
            <div className="text-sm">
              Style: {stylePoints} pts
            </div>
            <div className="text-sm">
              Progress: {sentencesUsed}/{maxSentences}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <Progress value={progress} className="h-1" />
        </div>
      </header>

      {/* Main Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Character Message */}
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary" />
            <div className="max-w-[80%] space-y-1">
              <div className="rounded-2xl rounded-tl-none bg-secondary p-3">
                <p className="text-sm">Bonjour! Comment puis-je vous aider?</p>
                <p className="text-xs text-muted-foreground">
                  Hello! How can I help you?
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-6">
                <Speaker className="mr-1 h-3 w-3" />
                <span className="text-xs">Listen</span>
              </Button>
            </div>
          </div>

          {/* User Message */}
          <div className="flex flex-row-reverse items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary" />
            <div className="max-w-[80%]">
              <div className="rounded-2xl rounded-tr-none bg-primary p-3 text-primary-foreground">
                <p className="text-sm">Je voudrais un café, s'il vous plaît.</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Response Options */}
      <div className="border-t bg-card p-4">
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => {/* TODO: Implement pronunciation modal */}}
          >
            <span className="flex-1">Oui, avec du lait s'il vous plaît.</span>
            <span className="text-xs text-muted-foreground">
              Yes, with milk please.
            </span>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => {/* TODO: Implement pronunciation modal */}}
          >
            <span className="flex-1">Non, noir c'est parfait.</span>
            <span className="text-xs text-muted-foreground">
              No, black is perfect.
            </span>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => {/* TODO: Implement pronunciation modal */}}
          >
            <span className="flex-1">Avec du sucre aussi, merci.</span>
            <span className="text-xs text-muted-foreground">
              With sugar too, thank you.
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuidedChat;