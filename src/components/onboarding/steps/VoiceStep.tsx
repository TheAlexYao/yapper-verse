import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface VoiceStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
  onPrev: () => void;
}

export function VoiceStep({ form, onNext, onPrev }: VoiceStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
          Personalize your own character's voice
        </h2>
        <p className="text-muted-foreground">
          The people you meet in Yapper will sound authentic and nuanced. Choose a voice style that feels right for you—it might subtly influence how characters address you, reflecting cultural norms and conversation patterns in your chosen language.
        </p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center space-x-1 text-sm text-muted-foreground cursor-help">
                <Info className="h-4 w-4" />
                <span>Why does this matter?</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>In many cultures, tone and address vary with context. By selecting a voice preference, you'll help us keep the experience consistent and comfortable for you.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

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
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem 
                          value="male" 
                          className="peer sr-only data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#38b6ff] data-[state=checked]:to-[#7843e6]" 
                        />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#38b6ff] [&:has([data-state=checked])]:border-[#38b6ff]">
                        Male Voice
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem 
                          value="female" 
                          className="peer sr-only data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#38b6ff] data-[state=checked]:to-[#7843e6]" 
                        />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#38b6ff] [&:has([data-state=checked])]:border-[#38b6ff]">
                        Female Voice
                      </FormLabel>
                    </FormItem>
                    <FormItem className="col-span-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <FormControl>
                                <RadioGroupItem 
                                  value="noPreference" 
                                  className="peer sr-only data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#38b6ff] data-[state=checked]:to-[#7843e6]" 
                                />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#38b6ff] [&:has([data-state=checked])]:border-[#38b6ff]">
                                No Preference
                              </FormLabel>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Defaults to female voice and gender</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90">
          Next
        </Button>
      </div>
    </div>
  );
}