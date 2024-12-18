import React from 'react';
import { Globe2 } from 'lucide-react';

interface Language {
  name: string;
  country: string;
}

const languages: Language[] = [
  { name: "English", country: "UK" },
  { name: "Mandarin", country: "China" },
  { name: "Cantonese", country: "Hong Kong" },
  { name: "Spanish", country: "Mexico & Spain" },
  { name: "French", country: "France & Canada" },
  { name: "Portuguese", country: "Brazil & Portugal" },
  { name: "Japanese", country: "Japan" },
  { name: "Korean", country: "South Korea" },
  { name: "Hindi", country: "India" },
  { name: "Tamil", country: "India" },
  { name: "Thai", country: "Thailand" },
  { name: "Vietnamese", country: "Vietnam" },
  { name: "Malay", country: "Malaysia" },
  { name: "German", country: "Germany" },
  { name: "Russian", country: "Russia" },
  { name: "Italian", country: "Italy" },
  { name: "Dutch", country: "Netherlands" },
  { name: "Polish", country: "Poland" },
  { name: "Swedish", country: "Sweden" },
  { name: "Norwegian", country: "Norway" }
];

const LanguageGrid = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {languages.map((lang, index) => (
        <div
          key={lang.name}
          className="group relative p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm 
                     hover:scale-105 transition-all duration-300 cursor-pointer animate-fadeIn"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 to-[#7843e6]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
          <div className="flex items-center space-x-3 mb-2">
            <Globe2 className="w-5 h-5 text-[#38b6ff] group-hover:text-[#7843e6] transition-colors" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
              {lang.name}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            {lang.country}
          </p>
        </div>
      ))}
    </div>
  );
};

export default LanguageGrid;