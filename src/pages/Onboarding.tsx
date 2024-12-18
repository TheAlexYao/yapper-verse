import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  nativeLanguage: z.string().min(1, "Please select your native language"),
  targetLanguage: z.string().min(1, "Please select your target language"),
  voicePreference: z.enum(["male", "female", "nonBinary", "noPreference"]),
  goals: z.array(z.string()).min(1, "Please select at least one goal"),
});

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
];

const goals = [
  {
    id: "pronunciation",
    label: "Improve Pronunciation",
    description: "Refine your accent so you're easily understood when asking for directions or making small talk.",
  },
  {
    id: "travel",
    label: "Learn Travel Phrases",
    description: "Handle everyday situations—ordering a meal, checking into a hotel, buying train tickets—like a savvy traveler.",
  },
  {
    id: "formal",
    label: "Master Formal Conversations",
    description: "Handle professional or polite scenarios, such as meeting clients, attending a family gathering, or discussing business over dinner.",
  },
  {
    id: "casual",
    label: "Casual, Everyday Speech",
    description: "Pick up the local slang, humor, and small talk that makes you blend in naturally.",
  },
];

const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nativeLanguage: "",
      targetLanguage: "",
      voicePreference: "noPreference",
      goals: [],
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // Handle form submission
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Dynamic background gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#7843e6]/10 animate-gradient-shift" />
      <div className="fixed inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7843e6] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-background/50 backdrop-blur-sm border rounded-lg p-8 shadow-lg">
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
                  Welcome to Yapper, Your Global Conversation Partner
                </h1>
                <p className="text-lg text-muted-foreground">
                  You're about to step into new neighborhoods around the world—no passport required. Let's set you up with the right tools so you can learn to talk, listen, and truly connect.
                </p>
                <Button onClick={nextStep} className="w-full md:w-auto">
                  Let's Begin
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-3xl font-bold">Pick Your Languages</h2>
                <p className="text-muted-foreground">
                  Choose your home base (native language) and where you'd like to go next (target language).
                </p>
                <Form {...form}>
                  <form className="space-y-6">
                    <FormField
                      control={form.control}
                      name="nativeLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Native Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your native language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your target language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep}>Next</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-3xl font-bold">Personalize the Voices You'll Hear</h2>
                <p className="text-muted-foreground">
                  The people you meet in Yapper will sound authentic and nuanced. Choose a voice style that feels right for you.
                </p>
                <Form {...form}>
                  <form className="space-y-6">
                    <FormField
                      control={form.control}
                      name="voicePreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 gap-4"
                            >
                              <Label
                                htmlFor="male"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                              >
                                <RadioGroupItem value="male" id="male" className="sr-only" />
                                <span>Male</span>
                              </Label>
                              <Label
                                htmlFor="female"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                              >
                                <RadioGroupItem value="female" id="female" className="sr-only" />
                                <span>Female</span>
                              </Label>
                              <Label
                                htmlFor="nonBinary"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                              >
                                <RadioGroupItem value="nonBinary" id="nonBinary" className="sr-only" />
                                <span>Non-binary</span>
                              </Label>
                              <Label
                                htmlFor="noPreference"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                              >
                                <RadioGroupItem value="noPreference" id="noPreference" className="sr-only" />
                                <span>No Preference</span>
                              </Label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep}>Next</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-3xl font-bold">What Do You Want Out of These Conversations?</h2>
                <p className="text-muted-foreground">
                  Select the goals that matter most to you, and we'll shape your experience around those authentic moments.
                </p>
                <div className="grid gap-4">
                  {goals.map((goal) => (
                    <Label
                      key={goal.id}
                      htmlFor={goal.id}
                      className="flex flex-col space-y-2 rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={goal.id}
                          className="form-checkbox h-4 w-4"
                          onChange={(e) => {
                            const currentGoals = form.getValues("goals");
                            if (e.target.checked) {
                              form.setValue("goals", [...currentGoals, goal.id]);
                            } else {
                              form.setValue(
                                "goals",
                                currentGoals.filter((g) => g !== goal.id)
                              );
                            }
                          }}
                        />
                        <span className="font-medium">{goal.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </Label>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep}>Next</Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-3xl font-bold">You're Almost Ready to Chat</h2>
                <div className="space-y-4">
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="font-medium">Your Preferences</h3>
                    <dl className="mt-2 space-y-2">
                      <div>
                        <dt className="text-sm text-muted-foreground">Native Language</dt>
                        <dd>{languages.find(l => l.value === form.getValues("nativeLanguage"))?.label || "Not selected"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Target Language</dt>
                        <dd>{languages.find(l => l.value === form.getValues("targetLanguage"))?.label || "Not selected"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Voice Preference</dt>
                        <dd className="capitalize">{form.getValues("voicePreference")}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Selected Goals</dt>
                        <dd>
                          <ul className="list-disc list-inside">
                            {form.getValues("goals").map((goalId) => (
                              <li key={goalId}>
                                {goals.find((g) => g.id === goalId)?.label}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Remember, you can revisit these settings anytime if your perspective changes or you've grown more confident in certain areas.
                  </p>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={() => onSubmit(form.getValues())}>
                    Finish & Explore
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;