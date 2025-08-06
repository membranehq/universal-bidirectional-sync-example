"use client";

import { CircleCheck, CircleDashed } from "lucide-react";

interface SectionWithStatusProps {
  done: boolean;
  children: React.ReactNode;
}

export function SectionWithStatus({
  done,
  children,
}: SectionWithStatusProps) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <span className="">
        {done ? (
          <CircleCheck className="w-5 h-5 bg-green-600 text-white rounded-full" />
        ) : (
          <CircleDashed className="text-gray-300 w-5 h-5" />
        )}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
} 