import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FormLabelProps {
  label: string;
  tooltip?: string;
  className?: string;
  size?: "sm" | "md";
}

export function FormLabel({ label, tooltip, className = "", size = "md" }: FormLabelProps) {
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`font-semibold text-gray-500 ${textSize}`}>
        {label}
      </span>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className={`${iconSize} text-gray-400 cursor-help`} />
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
} 