import { Badge } from "@/components/ui/badge";
import recordTypesConfig from "@/lib/record-type-config";

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
  const Icon = recordTypesConfig[recordType as keyof typeof recordTypesConfig]?.icon;

  return (
    <Badge variant={variant} className={className}>
      {Icon && (
        <Icon className="w-3.5 h-3.5 text-muted-foreground mr-1" />
      )}
      {recordType}
    </Badge>
  );
} 