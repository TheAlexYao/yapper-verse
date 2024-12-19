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
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        Choose your response:
      </h3>
      <div className="grid gap-2">
        {responses.map((response) => (
          <Button
            key={response.id}
            variant="outline"
            className="w-full justify-start text-left h-auto py-2 hover:bg-accent/50 transition-all duration-200"
            onClick={() => onSelectResponse(response)}
          >
            <div>
              <div className="font-medium">{response.text}</div>
              <div className="text-sm text-muted-foreground">
                {response.translation}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}