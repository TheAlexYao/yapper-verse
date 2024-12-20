import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface WelcomeStepProps {
  onNext: () => void;
  form: UseFormReturn<any>;
}

export function WelcomeStep({ onNext, form }: WelcomeStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
        Welcome to Yapper, Your Global Conversation Partner
      </h1>
      <p className="text-lg text-muted-foreground">
        You're about to step into new neighborhoods around the world—no passport required. Let's set you up with the right tools so you can learn to talk, listen, and truly connect. Don't worry, you can adjust any of this later. For now, think of this as a quick chat before heading out on your next journey.
      </p>
      
      <FormField
        control={form.control}
        name="fullName"
        rules={{ required: "Please enter your name" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>What should we call you?</FormLabel>
            <Input
              {...field}
              placeholder="Enter your full name"
              className="max-w-md"
            />
          </FormItem>
        )}
      />

      <Button 
        onClick={onNext} 
        className="w-full md:w-auto bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
        disabled={!form.getValues("fullName")}
      >
        Let's Begin
      </Button>
    </div>
  );
}