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
  zh_hans: "Mandarin (Simplified)",
  zh_hant: "Mandarin (Traditional)",
  yue: "Cantonese (Traditional)",
  es_mx: "Spanish (Mexico)",
  es_es: "Spanish (Spain)",
  fr_fr: "French (France)",
  fr_ca: "French (Canada)",
  pt_br: "Portuguese (Brazil)",
  pt_pt: "Portuguese (Portugal)",
  ja: "Japanese",
  ko: "Korean",
  hi: "Hindi",
  ta: "Tamil",
  th: "Thai",
  vi: "Vietnamese",
  ms: "Malay",
  de: "German",
  ru: "Russian",
  it: "Italian",
  nl: "Dutch",
  pl: "Polish",
  sv: "Swedish",
  nb: "Norwegian (Bokmål)",
};

const voicePreferences: Record<string, string> = {
  male: "Male Voice",
  female: "Female Voice",
  noPreference: "No Preference",
};

const learningGoals: Record<string, string> = {
  "improve-pronunciation": "Improve Pronunciation",
  "travel-phrases": "Learn Travel Phrases",
  "formal-conversations": "Master Formal Conversations",
  "casual-speech": "Casual, Everyday Speech",
};

export function ReviewStep({ form, onSubmit, onPrev }: ReviewStepProps) {
  const formValues = form.getValues();

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
        You're Almost Ready to Chat
      </h2>
      <p className="text-muted-foreground">
        With these choices, Yapper will introduce you to everyday situations, authentic dialogues, and cultural nuances that go beyond textbook phrases. This is your starting point; we'll adjust as you learn and discover what resonates with you.
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
              <div className="text-muted-foreground space-y-1">
                {formValues.goals?.map((goal: string) => (
                  <p key={goal}>{learningGoals[goal]}</p>
                ))}
                {formValues.customGoals?.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <p className="font-medium text-sm text-muted-foreground/80">Custom Goals:</p>
                    {formValues.customGoals.map((goal: string, index: number) => (
                      <p key={index} className="text-sm italic">{goal}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Remember, you can revisit these settings anytime if your perspective changes or you've grown more confident in certain areas.
      </p>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        <Button 
          onClick={() => onSubmit(formValues)} 
          className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
        >
          Finish & Explore
        </Button>
      </div>
    </div>
  );
}