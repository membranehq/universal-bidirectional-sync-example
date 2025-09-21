import { Folder } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { foldersSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface FolderRecordProps {
  record: IRecord;
}

type FolderData = z.infer<typeof foldersSchema>;

export function FolderRecord({ record }: FolderRecordProps) {
  const folderData = record.data as Partial<FolderData>;

  const folderName = typeof folderData?.name === 'string' ? folderData.name : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {folderName || "Unknown Folder"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
