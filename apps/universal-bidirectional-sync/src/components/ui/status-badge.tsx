import { CheckIcon, XIcon, Loader2 } from "lucide-react";
import { SyncStatusObject } from "@/models/types";

interface StatusBadgeProps {
  status: string;
  className?: string;
  text?: string;
}

export function StatusBadge({
  status,
  className = "",
  text,
}: StatusBadgeProps) {
  // Helper to render sync status icon
  const renderStatusIcon = () => {
    switch (status) {
      case SyncStatusObject.COMPLETED:
        return <CheckIcon className="w-4 h-4 text-green-500" />;
      case SyncStatusObject.PENDING:
      case SyncStatusObject.IN_PROGRESS:
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case SyncStatusObject.FAILED:
        return <XIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`pl-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize flex items-center gap-1 ${className}`}
    >
      {renderStatusIcon()}
      <span className="pr-2 py-0.5 font-bold">{text || status}</span>
    </span>
  );
}
