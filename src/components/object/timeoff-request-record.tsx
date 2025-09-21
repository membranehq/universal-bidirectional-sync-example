import { Calendar } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { timeoffrequestsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface TimeoffRequestRecordProps {
  record: IRecord;
}

type TimeoffRequestData = z.infer<typeof timeoffrequestsSchema>;

export function TimeoffRequestRecord({ record }: TimeoffRequestRecordProps) {
  const timeoffRequestData = record.data as Partial<TimeoffRequestData>;

  const requestType = typeof timeoffRequestData?.requestType === 'string' ? timeoffRequestData.requestType : null;
  const amount = typeof timeoffRequestData?.amount === 'number' ? timeoffRequestData.amount : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {requestType || "Timeoff Request"} {amount ? `(${amount})` : ""}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
