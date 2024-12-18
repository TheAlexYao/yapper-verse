import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroupItem } from "@/components/ui/radio-group";

interface VoiceOptionProps {
  value: string;
  label: string;
}

export function VoiceOption({ value, label }: VoiceOptionProps) {
  return (
    <FormItem>
      <FormControl>
        <RadioGroupItem 
          value={value} 
          className="peer sr-only data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#38b6ff] data-[state=checked]:to-[#7843e6]" 
        />
      </FormControl>
      <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#38b6ff] [&:has([data-state=checked])]:border-[#38b6ff]">
        {label}
      </FormLabel>
    </FormItem>
  );
}