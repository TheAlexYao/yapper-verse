import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const validLanguages = React.useMemo(() => Array.isArray(languages) ? languages : [], [languages]);

  return (
    <Select value={value} onValueChange={onSelect}>
      <FormControl>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}>
            {value && validLanguages.find(lang => lang.value === value)?.emoji + " " + 
              validLanguages.find(lang => lang.value === value)?.label}
          </SelectValue>
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {validLanguages.map((lang) => (
          <SelectItem
            key={lang.value}
            value={lang.value}
            disabled={lang.value === otherSelectedValue}
          >
            <span className="flex items-center gap-2">
              <span>{lang.emoji}</span>
              {lang.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}