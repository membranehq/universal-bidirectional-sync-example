import { Badge } from "@/components/ui/badge";
import appObjects from "@/lib/app-objects";

interface RecordTypeBadgeProps {
  recordType: string;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export function RecordTypeBadge({
  recordType,
  variant = "secondary",
  className
}: RecordTypeBadgeProps) {
  const Icon = appObjects[recordType as keyof typeof appObjects]?.icon;

  return (
    <Badge variant={variant} className={className}>
      {Icon && (
        <Icon className="w-3.5 h-3.5 text-muted-foreground mr-1" />
      )}
      {recordType}
    </Badge>
  );
} 