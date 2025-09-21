import { IRecord } from "@/models/types";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { AlertCircle } from "lucide-react";
import { activitiesSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";

interface ActivityRecordProps {
  record: IRecord;
}


type ActivityData = z.infer<typeof activitiesSchema>;

export function ActivityRecord({ record }: ActivityRecordProps) {
  const activityData = record.data as Partial<ActivityData>;

  const title = typeof activityData?.title === 'string' ? activityData.title : null;
  const type = typeof activityData?.type === 'string' ? activityData.type : null;
  const status = typeof activityData?.status === 'string' ? activityData.status : null;
  const durationSeconds = typeof activityData?.durationSeconds === 'number' ? activityData.durationSeconds : null;
  const location = typeof activityData?.location === 'string' ? activityData.location : null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {title || "Unknown Activity"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {type && (
              <span>{type}</span>
            )}
            {status && (
              <span>• {status}</span>
            )}
            {durationSeconds !== null && (
              <span>• {formatDuration(durationSeconds)}</span>
            )}
            {location && (
              <span>• {location}</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
