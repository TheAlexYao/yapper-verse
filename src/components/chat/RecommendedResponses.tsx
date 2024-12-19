import { Button } from "@/components/ui/button";

interface Response {
  id: string;
  text: string;
  translation: string;
  hint?: string;
}

interface RecommendedResponsesProps {
  responses: Response[];
  onSelectResponse: (response: Response) => void;
}

export function RecommendedResponses({
  responses,
  onSelectResponse,
}: RecommendedResponsesProps) {
  return (
    <div className="border-t bg-background/80 backdrop-blur-sm p-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yapper-indigo opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yapper-indigo"></span>
        </span>
        Choose your response:
      </h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {responses.map((response) => (
          <Button
            key={response.id}
            variant="outline"
            className="w-full justify-start text-left h-auto py-2 hover:bg-accent/50 transition-all duration-200 break-words"
            onClick={() => onSelectResponse(response)}
          >
            <div>
              <div className="font-medium break-words">{response.text}</div>
              <div className="text-sm text-muted-foreground break-words">
                {response.translation}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}