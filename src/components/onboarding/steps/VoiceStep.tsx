import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VoiceStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
  onPrev: () => void;
}

export function VoiceStep({ form, onNext, onPrev }: VoiceStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Choose Your Voice Preference</h2>
      <p className="text-muted-foreground">
        Select your preferred voice type for the AI conversation partner.
      </p>
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="voicePreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voice Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="male" className="peer sr-only data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#38b6ff] data-[state=checked]:to-[#7843e6]" />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#38b6ff] [&:has([data-state=checked])]:border-[#38b6ff]">
                        Male Voice
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="female" className="peer sr-only data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#38b6ff] data-[state=checked]:to-[#7843e6]" />
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
                                <RadioGroupItem value="noPreference" className="peer sr-only data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#38b6ff] data-[state=checked]:to-[#7843e6]" />
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