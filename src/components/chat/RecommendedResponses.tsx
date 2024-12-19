import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

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
  const [currentPage, setCurrentPage] = useState(0);
  const responsesPerPage = 2;
  const totalPages = Math.ceil(responses.length / responsesPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentResponses = responses.slice(
    currentPage * responsesPerPage,
    (currentPage + 1) * responsesPerPage
  );

  return (
    <div className="border-t bg-background/80 backdrop-blur-sm p-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yapper-indigo opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yapper-indigo"></span>
        </span>
        Choose your response:
      </h3>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevPage}
          disabled={totalPages <= 1}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="grid gap-2 flex-1">
          {currentResponses.map((response) => (
            <Button
              key={response.id}
              variant="outline"
              className="w-full justify-start text-left h-auto py-2 hover:bg-accent/50 transition-all duration-200"
              onClick={() => onSelectResponse(response)}
            >
              <div className="break-words">
                <div className="font-medium">{response.text}</div>
                <div className="text-sm text-muted-foreground">
                  {response.translation}
                </div>
              </div>
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextPage}
          disabled={totalPages <= 1}
          className="shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}