import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Language {
  name: string;
  flag: string;
  code: string;
  variant?: string;
}

const languages: Language[] = [
  { name: "English", flag: "🇬🇧", code: "en" },
  { name: "Mandarin", flag: "🇨🇳", code: "zh", variant: "Simplified" },
  { name: "Mandarin", flag: "🇹🇼", code: "zh", variant: "Traditional" },
  { name: "Cantonese", flag: "🇭🇰", code: "yue", variant: "Traditional" },
  { name: "Spanish", flag: "🇲🇽", code: "es", variant: "Mexico" },
  { name: "Spanish", flag: "🇪🇸", code: "es", variant: "Spain" },
  { name: "French", flag: "🇫🇷", code: "fr", variant: "France" },
  { name: "French", flag: "🇨🇦", code: "fr", variant: "Canada" },
  { name: "Portuguese", flag: "🇧🇷", code: "pt", variant: "Brazil" },
  { name: "Portuguese", flag: "🇵🇹", code: "pt", variant: "Portugal" },
  { name: "Japanese", flag: "🇯🇵", code: "ja" },
  { name: "Korean", flag: "🇰🇷", code: "ko" },
  { name: "Hindi", flag: "🇮🇳", code: "hi" },
  { name: "Tamil", flag: "🇱🇰", code: "ta" },
  { name: "Thai", flag: "🇹🇭", code: "th" },
  { name: "Vietnamese", flag: "🇻🇳", code: "vi" },
  { name: "Malay", flag: "🇲🇾", code: "ms" },
  { name: "German", flag: "🇩🇪", code: "de" },
  { name: "Russian", flag: "🇷🇺", code: "ru" },
  { name: "Italian", flag: "🇮🇹", code: "it" },
  { name: "Dutch", flag: "🇳🇱", code: "nl" },
  { name: "Polish", flag: "🇵🇱", code: "pl" },
  { name: "Swedish", flag: "🇸🇪", code: "sv" },
  { name: "Norwegian", flag: "🇳🇴", code: "nb", variant: "Bokmål" },
];

const LanguageTicker = () => {
  const isMobile = useIsMobile();
  const duplicatedLanguages = [...languages, ...languages];

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-[#38b6ff]/10 via-transparent to-[#7843e6]/10 py-8">
      <div className={`${isMobile ? 'animate-ticker-mobile' : 'animate-ticker'} flex space-x-8`}>
        {duplicatedLanguages.map((lang, index) => (
          <div
            key={`${lang.code}-${index}`}
            className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
          >
            <span className="text-xl">{lang.flag}</span>
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