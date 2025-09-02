import { Building2 } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { jobsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "@/models/types";

interface JobRecordProps {
  record: IRecord;
}


type JobData = z.infer<typeof jobsSchema>;

export function JobRecord({ record }: JobRecordProps) {
  const jobData = record.data as Partial<JobData>;

  const jobName = typeof jobData?.name === 'string' ? jobData.name : null;
  const jobCode = typeof jobData?.code === 'string' ? jobData.code : null;
  const status = typeof jobData?.status === 'string' ? jobData.status : null;
  const description = typeof jobData?.description === 'string' ? jobData.description : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {jobName || "Unknown Job"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {jobCode && (
              <span>{jobCode}</span>
            )}
            {status && (
              <span>• {status}</span>
            )}
            {description && (
              <span className="truncate">• {description}</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
