import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FormControl } from "@/components/ui/form";

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
  languages = [], 
  otherSelectedValue,
  placeholder 
}: LanguageSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const selectedLanguage = React.useMemo(
    () => languages.find((lang) => lang.value === value),
    [languages, value]
  );

  // Ensure we have a valid array for the Command component
  const validLanguages = React.useMemo(() => Array.isArray(languages) ? languages : [], [languages]);

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
              <>
                <span className="mr-2">{selectedLanguage.emoji}</span>
                {selectedLanguage.label}
              </>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search languages..." />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
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
                <span className="mr-2">{lang.emoji}</span>
                {lang.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}