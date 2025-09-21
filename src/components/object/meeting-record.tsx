import { Video } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { meetingsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface MeetingRecordProps {
  record: IRecord;
}

type MeetingData = z.infer<typeof meetingsSchema>;

export function MeetingRecord({ record }: MeetingRecordProps) {
  const meetingData = record.data as Partial<MeetingData>;

  const meetingTitle = typeof meetingData?.title === 'string' ? meetingData.title : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Video className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {meetingTitle || "Unknown Meeting"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
