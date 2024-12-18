import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function InfoTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center space-x-1 text-sm text-muted-foreground cursor-help">
            <Info className="h-4 w-4" />
            <span>Why does this matter?</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>In many cultures, tone and address vary with context. By selecting a voice preference, you'll help us keep the experience consistent and comfortable for you.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}