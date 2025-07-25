import { Loader2 } from "lucide-react";

interface LoaderProps {
  message?: string;
  className?: string;
}

export function Loader({ message = "Loading...", className = "" }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center h-64 text-muted-foreground ${className}`}>
      <Loader2 className="animate-spin w-8 h-8 mb-2" />
      <span>{message}</span>
    </div>
  );
} 