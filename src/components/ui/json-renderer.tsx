"use client";

import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';
import { darkTheme } from '@uiw/react-json-view/dark';
import { useTheme } from "next-themes";

interface JsonRendererProps {
  data: object;
  title?: string;
  collapsed?: boolean;
  className?: string;
}

export function JsonRenderer({
  data,
  title,
  className = "",
}: JsonRendererProps) {
  const { theme } = useTheme();
  const jsonViewTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <div className={`relative ${className}`}>
      {title && (
        <div className="flex items-center mb-2 px-2 py-1 bg-muted/50 rounded-t-md border-b">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
        </div>
      )}
      <div className="rounded-md border">
        <div className="font-mono text-sm">
          <JsonView value={data} style={jsonViewTheme} shortenTextAfterLength={0} displayDataTypes={false} />
        </div>
      </div>
    </div>
  );
}

