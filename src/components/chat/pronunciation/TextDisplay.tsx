interface TextDisplayProps {
  text: string;
  translation: string;
  transliteration?: string;
}

export function TextDisplay({ text, translation, transliteration }: TextDisplayProps) {
  return (
    <div className="p-4 rounded-lg bg-accent/50">
      <div className="space-y-1">
        <p className="font-medium">{text}</p>
        {transliteration && (
          <p className="text-sm italic text-muted-foreground">
            {transliteration}
          </p>
        )}
        <p className="text-sm text-muted-foreground">{translation}</p>
      </div>
    </div>
  );
}