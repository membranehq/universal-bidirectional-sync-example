"use client";

import React from "react";

export interface SelectionGroupWrapperProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  showEmptyMessage?: boolean;
  emptyMessage?: string;
  className?: string;
  size?: "xs" | "sm" | "lg";
  children: React.ReactNode;
}

export function SelectionGroupWrapper({
  title,
  description,
  icon: TitleIcon,
  loading,
  showEmptyMessage,
  emptyMessage,
  className,
  size = "lg",
  children,
}: SelectionGroupWrapperProps) {
  const shouldShowEmpty = Boolean(showEmptyMessage && !loading && emptyMessage);

  const sizeVariants = {
    xs: {
      icon: "w-4 h-4 sm:w-5 sm:h-5",
      text: "text-sm",
      description: "text-sm",
      margin: "ml-5 sm:ml-6"
    },
    sm: {
      icon: "w-4 h-4 sm:w-5 sm:h-5",
      text: "text-md",
      description: "text-sm",
      margin: "ml-5 sm:ml-6"
    },
    lg: {
      icon: "w-5 h-5 sm:w-6 sm:h-6",
      text: "text-lg",
      description: "text-md",
      margin: "ml-7 sm:ml-8"
    }
  };

  const currentSize = sizeVariants[size];

  return (
    <div className={className}>
      <div className="mb-3">
        <p className={`${currentSize.text} font-semibold flex items-center gap-2 text-gray-900 tracking-tight`}>
          {TitleIcon ? (
            <TitleIcon className={`${currentSize.icon} text-gray-600`} />
          ) : null}
          {title}
        </p>
        {description ? (
          <p className={`${currentSize.description} text-gray-600 mt-1 ${currentSize.margin} mb-3`}>{description}</p>
        ) : null}
      </div>

      {shouldShowEmpty ? (
        <div className={`${currentSize.description} text-gray-500 italic ${currentSize.margin} bg-gray-100 p-2 rounded-md self-start`}>
          {emptyMessage}
        </div>
      ) : (
        <div className={currentSize.margin}>
          {children}
        </div>
      )}
    </div>
  );
}


