import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", text }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-8 w-8",
      lg: "h-12 w-12",
    };

    return (
      <div ref={ref} className={cn("flex flex-col items-center justify-center min-h-[200px] gap-3", className)}>
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export function LoadingSpinnerInline({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
  );
}
