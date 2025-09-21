import { HardDrive } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { drivesSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface DriveRecordProps {
  record: IRecord;
}

type DriveData = z.infer<typeof drivesSchema>;

export function DriveRecord({ record }: DriveRecordProps) {
  const driveData = record.data as Partial<DriveData>;

  const driveName = typeof driveData?.name === 'string' ? driveData.name : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <HardDrive className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {driveName || "Unknown Drive"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
