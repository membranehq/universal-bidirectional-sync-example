import { UserCheck } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { jobinterviewsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface JobInterviewRecordProps {
  record: IRecord;
}

type JobInterviewData = z.infer<typeof jobinterviewsSchema>;

export function JobInterviewRecord({ record }: JobInterviewRecordProps) {
  const jobInterviewData = record.data as Partial<JobInterviewData>;

  const stage = typeof jobInterviewData?.stage === 'string' ? jobInterviewData.stage : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            Interview {stage ? `(${stage})` : ""}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
