import { File } from "lucide-react";
import type { IRecord } from "@/models/types";
import { RecordTypeWrapper } from "./RecordTypeWrapper";
import { fileSchema } from "@/lib/record-type-config";
import { z } from "zod";

interface FileRecordProps {
  record: IRecord;
}

// Derive the type from the Zod schema
type FileData = z.infer<typeof fileSchema>;

export function FileRecord({ record }: FileRecordProps) {
  const fileData = record.data as Partial<FileData>;

  const fileName = typeof fileData?.name === 'string' ? fileData.name : null;
  const fileSize = typeof fileData?.size === 'number' ? fileData.size : null;
  const isFolder = typeof fileData?.isFolder === 'boolean' ? fileData.isFolder : false;

  const formatFileSize = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <RecordTypeWrapper>
      <div className="flex items-center gap-2 min-w-0">
        <File className="w-4 h-4 text-purple-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate">
            {fileName || record.name || "Unknown File"}
          </span>
          {!isFolder && fileSize && (
            <span className="text-xs text-gray-500 truncate">
              {formatFileSize(fileSize)}
            </span>
          )}
        </div>
      </div>
    </RecordTypeWrapper>
  );
}
