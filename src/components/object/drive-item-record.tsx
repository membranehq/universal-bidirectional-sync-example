import { File } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { driveitemsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface DriveItemRecordProps {
  record: IRecord;
}

type DriveItemData = z.infer<typeof driveitemsSchema>;

export function DriveItemRecord({ record }: DriveItemRecordProps) {
  const driveItemData = record.data as Partial<DriveItemData>;

  const itemName = typeof driveItemData?.name === 'string' ? driveItemData.name : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <File className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {itemName || "Unknown Drive Item"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
