import { Button } from "@/components/ui/button";

export const CATEGORIES = [
  { id: "All", emoji: "✨" },
  { id: "Food", emoji: "🍜" },
  { id: "Dating", emoji: "💏" },
  { id: "Learning", emoji: "🧠" },
  { id: "Work", emoji: "💼" },
  { id: "Friends", emoji: "👥" },
  { id: "Travel", emoji: "✈️" },
  { id: "Shopping", emoji: "🛍️" },
  { id: "Play", emoji: "🎮" }
];

interface CategoryFiltersProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export function CategoryFilters({ selectedCategory, onCategorySelect }: CategoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
      {CATEGORIES.map(({ id, emoji }) => (
        <Button
          key={id}
          variant={selectedCategory === id ? "default" : "outline"}
          onClick={() => onCategorySelect(id)}
          className={`transition-all duration-300 ease-out ${
            selectedCategory === id
              ? "bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 shadow-lg scale-105"
              : "hover:bg-accent hover:text-accent-foreground hover:scale-105"
          } gap-2 text-base px-6`}
        >
          <span role="img" aria-label={id} className="text-lg">{emoji}</span>
          {id}
        </Button>
      ))}
    </div>
  );
}