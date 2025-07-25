import { CheckIcon, XIcon, Loader2 } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  // Helper to render sync status icon
  const renderStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckIcon className="w-4 h-4 text-green-500" />;
      case "pending":
      case "in_progress":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "failed":
        return <XIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize flex items-center gap-1 ${className}`}>
      {renderStatusIcon()}
      {status}
    </span>
  );
} 