import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MessageSkeletonProps {
  isUser?: boolean;
}

export function MessageSkeleton({ isUser = false }: MessageSkeletonProps) {
  return (
    <div className={cn(
      "flex gap-2",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex flex-col gap-2 max-w-[80%] rounded-2xl p-4",
        isUser ? 
          "bg-gradient-to-r from-[#38b6ff]/70 to-[#7843e6]/70" : 
          "bg-accent/70"
      )}>
        {isUser ? (
          // User message skeleton - simple loading animation
          <>
            <div className="h-4 bg-white/20 rounded w-24 animate-pulse" />
            <div className="h-4 bg-white/20 rounded w-32 animate-pulse" />
          </>
        ) : (
          // AI message skeleton - typing indicator animation
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-foreground/70" />
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-foreground/70 animate-bounce [animation-delay:-0.3s]" />
              <div className="h-2 w-2 rounded-full bg-foreground/70 animate-bounce [animation-delay:-0.15s]" />
              <div className="h-2 w-2 rounded-full bg-foreground/70 animate-bounce" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}