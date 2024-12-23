import { cn } from "@/lib/utils";

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
        "flex flex-col gap-2 max-w-[80%] rounded-2xl p-4 animate-pulse",
        isUser ? "bg-gradient-to-r from-[#38b6ff]/70 to-[#7843e6]/70" : "bg-accent/70"
      )}>
        <div className="h-4 bg-white/20 rounded w-24" />
        <div className="h-4 bg-white/20 rounded w-32" />
      </div>
    </div>
  );
}