import { IRecord } from "@/models/types";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { Building } from "lucide-react";
import { jobcandidatesSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";

interface JobCandidateRecordProps {
  record: IRecord;
}


type JobCandidateData = z.infer<typeof jobcandidatesSchema>;

export function JobCandidateRecord({ record }: JobCandidateRecordProps) {
  const candidateData = record.data as Partial<JobCandidateData>;

  const fullName = typeof candidateData?.fullName === 'string' ? candidateData.fullName : null;
  const title = typeof candidateData?.title === 'string' ? candidateData.title : null;
  const company = typeof candidateData?.company === 'string' ? candidateData.company : null;
  const primaryEmail = typeof candidateData?.primaryEmail === 'string' ? candidateData.primaryEmail : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Building className="w-3 h-3 sm:w-4 sm:h-4 text-teal-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {fullName || "Unknown Candidate"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {title && (
              <span>{title}</span>
            )}
            {company && (
              <span>• {company}</span>
            )}
            {primaryEmail && (
              <span>• {primaryEmail}</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
