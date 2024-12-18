import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
        Welcome to Yapper, Your Global Conversation Partner
      </h1>
      <p className="text-lg text-muted-foreground">
        You're about to step into new neighborhoods around the world—no passport required. Let's set you up with the right tools so you can learn to talk, listen, and truly connect.
      </p>
      <Button onClick={onNext} className="w-full md:w-auto bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90">
        Let's Begin
      </Button>
    </div>
  );
}