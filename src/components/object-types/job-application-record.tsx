import { Briefcase } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { jobapplicationsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "@/models/types";

interface JobApplicationRecordProps {
  record: IRecord;
}


type JobApplicationData = z.infer<typeof jobapplicationsSchema>;

export function JobApplicationRecord({ record }: JobApplicationRecordProps) {
  const jobAppData = record.data as Partial<JobApplicationData>;

  const status = typeof jobAppData?.status === 'string' ? jobAppData.status : null;
  const currentStage = typeof jobAppData?.currentStage === 'string' ? jobAppData.currentStage : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {"Job Application"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {status && (
              <span className="capitalize">{status}</span>
            )}
            {currentStage && (
              <span>• {currentStage}</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
