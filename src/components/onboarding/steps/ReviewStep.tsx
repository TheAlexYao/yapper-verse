import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";

interface ReviewStepProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any) => void;
  onPrev: () => void;
}

const languages: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
};

const voicePreferences: Record<string, string> = {
  male: "Male Voice",
  female: "Female Voice",
  noPreference: "No Preference",
};

const goals: Record<string, string> = {
  "casual-conversation": "Casual Conversation",
  "business-communication": "Business Communication",
  "academic-language": "Academic Language",
  "cultural-exchange": "Cultural Exchange",
};

export function ReviewStep({ form, onSubmit, onPrev }: ReviewStepProps) {
  const formValues = form.getValues();

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#38b6ff]/70 bg-clip-text text-transparent">Review Your Choices</h2>
      <p className="text-muted-foreground">
        Please review your selections before starting your language learning journey.
      </p>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Native Language</h3>
              <p className="text-muted-foreground">{languages[formValues.nativeLanguage]}</p>
            </div>
            <div>
              <h3 className="font-medium">Target Language</h3>
              <p className="text-muted-foreground">{languages[formValues.targetLanguage]}</p>
            </div>
            <div>
              <h3 className="font-medium">Voice Preference</h3>
              <p className="text-muted-foreground">{voicePreferences[formValues.voicePreference]}</p>
            </div>
            <div>
              <h3 className="font-medium">Learning Goals</h3>
              <div className="text-muted-foreground">
                {formValues.goals.map((goal: string) => (
                  <p key={goal}>{goals[goal]}</p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        <Button onClick={() => onSubmit(formValues)} className="bg-[#38b6ff] hover:bg-[#38b6ff]/90">
          Start Learning
        </Button>
      </div>
    </div>
  );
}