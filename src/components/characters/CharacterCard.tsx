import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Character } from "@/types/character";

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: (character: Character) => void;
  onStartConversation: () => void;
}

export function CharacterCard({ 
  character, 
  isSelected, 
  onSelect, 
  onStartConversation 
}: CharacterCardProps) {
  return (
    <div
      className={cn(
        "relative p-6 rounded-lg border bg-card/50 backdrop-blur-sm",
        isSelected ? "ring-2 ring-[#7843e6]" : ""
      )}
    >
      <div className="aspect-square rounded-full overflow-hidden mb-4 bg-muted mx-auto max-w-[200px]">
        <img
          src={character.avatar_url || "/placeholder.svg"}
          alt={character.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-xl font-semibold mb-1 text-center">
        {character.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-3 text-center">
        Age: {character.age}, {character.gender}
      </p>
      <p className="text-sm mb-4 text-center">{character.bio}</p>
      <div className="space-y-2 mb-4">
        <p className="text-sm font-semibold text-center">Language Style:</p>
        <ul className="list-none text-sm text-muted-foreground space-y-1">
          {character.language_style?.map((style, index) => (
            <li key={index} className="text-center">{style}</li>
          ))}
        </ul>
      </div>
      {isSelected ? (
        <Button
          className="w-full bg-gradient-to-r from-[#7843e6] to-[#38b6ff] text-white font-semibold"
          onClick={onStartConversation}
        >
          Let's Get Started!
        </Button>
      ) : (
        <Button
          className="w-full bg-[#38b6ff] hover:bg-[#2aa1ff] text-white"
          onClick={() => onSelect(character)}
        >
          Choose {character.name}
        </Button>
      )}
    </div>
  );
}