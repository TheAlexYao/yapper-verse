import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const validLanguages = React.useMemo(() => 
    Array.isArray(languages) ? languages : [], 
    [languages]
  );
  
  const filteredLanguages = React.useMemo(() => {
    if (!searchQuery) return validLanguages;
    const query = searchQuery.toLowerCase();
    return validLanguages.filter(
      (lang) =>
        lang.label.toLowerCase().includes(query) ||
        lang.value.toLowerCase().includes(query)
    );
  }, [validLanguages, searchQuery]);
  
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
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search languages..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {filteredLanguages.map((lang) => (
                <CommandItem
                  key={lang.value}
                  value={lang.value}
                  onSelect={(currentValue) => {
                    onSelect(currentValue === value ? "" : currentValue);
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}