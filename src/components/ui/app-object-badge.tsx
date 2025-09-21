import { Badge } from "@/components/ui/badge";
import appObjects from "@/lib/app-objects";
import { AppObjectKey } from "@/lib/app-objects-schemas";

interface AppObjectBadgeProps {
  appObjectKey: AppObjectKey;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export function AppObjectBadge({
  appObjectKey,
  variant = "secondary",
  className
}: AppObjectBadgeProps) {
  const Icon = appObjects[appObjectKey]?.icon;

  return (
    <Badge variant={variant} className={className}>
      {Icon && (
        <Icon className="w-3.5 h-3.5 text-muted-foreground mr-1" />
      )}
      {appObjectKey}
    </Badge>
  );
} 