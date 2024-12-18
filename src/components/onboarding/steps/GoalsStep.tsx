import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { PredefinedGoals } from "./goals/PredefinedGoals";
import { CustomGoals } from "./goals/CustomGoals";

interface GoalsStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
  onPrev: () => void;
}

export function GoalsStep({ form, onNext, onPrev }: GoalsStepProps) {
  const [customGoals, setCustomGoals] = useState<string[]>(form.getValues().customGoals || []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
          What Do You Want Out of These Conversations?
        </h2>
        <p className="text-muted-foreground">
          Are you hoping to confidently order street food, strike up conversations with locals at a café, 
          impress colleagues during a business trip, or navigate a new city without feeling lost? 
          Tell us what matters most, and we'll shape your experience around those authentic moments.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <PredefinedGoals form={form} />
          <CustomGoals 
            form={form}
            customGoals={customGoals}
            setCustomGoals={setCustomGoals}
          />
        </form>
      </Form>

      <Dialog>
        <DialogTrigger asChild>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground cursor-pointer">
            <HelpCircle className="h-4 w-4" />
            <span>Why are we asking about your goals?</span>
          </div>
        </DialogTrigger>
        <DialogContent>
          <p className="text-sm">
            Your chosen goals will influence what Yapper prioritizes. Want to navigate a farmers' market like a regular? 
            We've got you. Craving deeper chats with friends abroad? Just say the word.
          </p>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
        >
          Next
        </Button>
      </div>
    </div>
  );
}