import { Flag } from "lucide-react";

interface Language {
  name: string;
  code: string;
  variant?: string;
}

const languages: Language[] = [
  { name: "English", code: "en" },
  { name: "Mandarin", code: "zh", variant: "Simplified" },
  { name: "Mandarin", code: "zh", variant: "Traditional" },
  { name: "Cantonese", code: "yue", variant: "Traditional" },
  { name: "Spanish", code: "es", variant: "Mexico" },
  { name: "Spanish", code: "es", variant: "Spain" },
  { name: "French", code: "fr", variant: "France" },
  { name: "French", code: "fr", variant: "Canada" },
  { name: "Portuguese", code: "pt", variant: "Brazil" },
  { name: "Portuguese", code: "pt", variant: "Portugal" },
  { name: "Japanese", code: "ja" },
  { name: "Korean", code: "ko" },
  { name: "Hindi", code: "hi" },
  { name: "Tamil", code: "ta" },
  { name: "Thai", code: "th" },
  { name: "Vietnamese", code: "vi" },
  { name: "Malay", code: "ms" },
  { name: "German", code: "de" },
  { name: "Russian", code: "ru" },
  { name: "Italian", code: "it" },
  { name: "Dutch", code: "nl" },
  { name: "Polish", code: "pl" },
  { name: "Swedish", code: "sv" },
  { name: "Norwegian", code: "nb", variant: "Bokmål" },
];

const LanguageTicker = () => {
  // Double the languages array to create a seamless loop
  const duplicatedLanguages = [...languages, ...languages];

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-[#38b6ff]/10 via-transparent to-[#7843e6]/10 py-8">
      <div className="animate-ticker flex space-x-8">
        {duplicatedLanguages.map((lang, index) => (
          <div
            key={`${lang.code}-${index}`}
            className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
          >
            <Flag className="w-4 h-4 text-[#38b6ff]" />
            <span className="whitespace-nowrap text-sm">
              {lang.name}
              {lang.variant && <span className="text-xs text-muted-foreground ml-1">({lang.variant})</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageTicker;