import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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
    <div className="border-t bg-background/80 backdrop-blur-sm p-4 space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Choose your response:
      </h3>
      <div className="grid gap-2">
        {responses.map((response) => (
          <div key={response.id} className="relative">
            <Button
              variant="outline"
              className="w-full justify-between text-left h-auto py-3"
              onClick={() => onSelectResponse(response)}
            >
              <div>
                <div className="font-medium">{response.text}</div>
                <div className="text-sm text-muted-foreground">
                  {response.translation}
                </div>
              </div>
              {response.hint && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{response.hint}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}