import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { FormControl } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface Language {
  readonly value: string;
  readonly label: string;
  readonly emoji: string;
}

interface LanguageSelectorProps {
  value: string;
  onSelect: (value: string) => void;
  

<lov-code>
Let's update the LanguageSelector component to use only combobox functionality:

<lov-write file_path="src/components/onboarding/steps/language/LanguageSelector.tsx">
import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormControl } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface Language {
  readonly value: string;
  readonly label: string;
  readonly emoji: string;
}

interface LanguageSelectorProps {
  value: string;
  onSelect: (value: string) => void;
  languages: readonly Language[];
  otherSelectedValue?: string;
  placeholder: string;
}

export function LanguageSelector({ 
  value, 
  onSelect, 
  languages, 
  otherSelectedValue,
  placeholder 
}: LanguageSelectorProps) {
  const [open, setOpen] = React.useState(false);
  
  // Ensure languages is always an array, even if empty
  const validLanguages = React.useMemo(() => 
    Array.isArray(languages) ? languages : [], 
    [languages]
  );
  
  const selectedLanguage = validLanguages.find(lang => lang.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selectedLanguage ? (
              <span className="flex items-center gap-2">
                <span>{selectedLanguage.emoji}</span>
                {selectedLanguage.label}
              </span>
            ) : (
              placeholder
            )}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search languages..." />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup>
            {validLanguages.map((lang) => (
              <CommandItem
                key={lang.value}
                value={lang.value}
                onSelect={() => {
                  onSelect(lang.value);
                  setOpen(false);
                }}
                disabled={lang.value === otherSelectedValue}
                className="flex items-center gap-2"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === lang.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span>{lang.emoji}</span>
                {lang.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}