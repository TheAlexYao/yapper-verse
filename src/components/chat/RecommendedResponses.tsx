import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";

/**
 * Interface defining the structure of a response option
 * @property id - Unique identifier for the response
 * @property text - The response text in target language
 * @property translation - Translation in user's native language
 * @property hint - Optional contextual hint or usage note
 */
interface Response {
  id: string;
  text: string;
  translation: string;
  hint?: string;
}

/**
 * Props for the RecommendedResponses component
 * @property responses - Array of response options to display
 * @property onSelectResponse - Callback function when response is selected
 * @property isLoading - Loading state for UI feedback
 */
interface RecommendedResponsesProps {
  responses: Response[];
  onSelectResponse: (response: Response) => void;
  isLoading?: boolean;
}

/**
 * RecommendedResponses Component
 * 
 * Displays AI-generated response options for the user to choose from during
 * guided conversations. Implements a carousel-like interface for multiple options.
 * 
 * Features:
 * - Pagination between multiple responses
 * - Loading state handling
 * - Response selection with translation display
 * - Responsive design with mobile considerations
 */
export function RecommendedResponses({
  responses,
  onSelectResponse,
  isLoading = false,
}: RecommendedResponsesProps) {
  // Track current page in carousel of responses
  const [currentPage, setCurrentPage] = useState(0);
  const responsesPerPage = 1;
  const totalPages = Math.ceil(responses.length / responsesPerPage);

  /**
   * Advances to next response in carousel
   * Wraps around to start if at end
   */
  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  /**
   * Goes to previous response in carousel
   * Wraps around to end if at start
   */
  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Get current page of responses for display
  const currentResponses = responses.slice(
    currentPage * responsesPerPage,
    (currentPage + 1) * responsesPerPage
  );

  return (
    <div className="p-3 bg-gradient-to-b from-background via-accent/10 to-accent/20">
      {/* Section header with live indicator */}
      <h3 className="text-sm font-medium text-muted-foreground mb-2.5 flex items-center">
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yapper-indigo opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yapper-indigo"></span>
        </span>
        Choose your response:
      </h3>

      {/* Response carousel container */}
      <div className="flex items-center gap-1.5 w-full">
        {/* Previous page button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={prevPage}
          disabled={totalPages <= 1 || isLoading}
          className="shrink-0 p-0 w-8 h-8 hover:bg-accent/50 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Response display area */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {currentResponses.map((response) => (
            <Button
              key={response.id}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-accent/50 transition-all duration-200 bg-gradient-to-r from-background to-accent/10 rounded-xl overflow-hidden disabled:opacity-50"
              onClick={() => onSelectResponse(response)}
              disabled={isLoading}
            >
              <div className="w-full overflow-hidden flex items-center gap-2">
                {/* Loading indicator */}
                {isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                )}
                {/* Response content */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{response.text}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {response.translation}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Next page button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={nextPage}
          disabled={totalPages <= 1 || isLoading}
          className="shrink-0 p-0 w-8 h-8 hover:bg-accent/50 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page indicators */}
      <div className="flex justify-center mt-2 gap-1">
        {Array.from({ length: totalPages }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              index === currentPage
                ? "w-4 bg-yapper-indigo"
                : "w-1.5 bg-accent/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}