import { ReactNode } from "react";

interface AppObjectComponentWrapperProps {
  children: ReactNode;
  className?: string;
}

export function AppObjectComponentWrapper({ children, className = "" }: AppObjectComponentWrapperProps) {
  const baseClasses = "flex-1 pr-2 sm:pr-4 py-3 whitespace-nowrap text-xs sm:text-sm min-w-0";
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
} 