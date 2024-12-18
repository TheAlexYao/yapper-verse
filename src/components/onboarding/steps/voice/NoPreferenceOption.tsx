import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface NoPreferenceOptionProps {
  value: string;
}

export function NoPreferenceOption({ value }: NoPreferenceOptionProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <FormItem className="col-span-2">
        <div className="space-y-2">
          <FormControl>
            <RadioGroupItem 
              value="noPreference" 
              className="peer sr-only data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#38b6ff] data-[state=checked]:to-[#7843e6]" 
            />
          </FormControl>
          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#38b6ff] [&:has([data-state=checked])]:border-[#38b6ff]">
            No Preference
          </FormLabel>
          {value === "noPreference" && (
            <p className="text-sm text-muted-foreground text-center px-4">
              Defaults to female voice and gender
            </p>
          )}
        </div>
      </FormItem>
    );
  }

  return (
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
  );
}