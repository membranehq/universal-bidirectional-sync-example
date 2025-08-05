import { ReactNode } from "react";

interface RecordTypeWrapperProps {
  children: ReactNode;
  className?: string;
}

export function RecordTypeWrapper({ children, className = "" }: RecordTypeWrapperProps) {
  const baseClasses = "flex-1 pr-4 py-3 whitespace-nowrap text-sm min-w-0";
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
} 