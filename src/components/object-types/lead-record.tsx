import { IRecord } from "@/models/types";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { User } from "lucide-react";
import { leadsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";

interface LeadRecordProps {
  record: IRecord;
}


type LeadData = z.infer<typeof leadsSchema>;

export function LeadRecord({ record }: LeadRecordProps) {
  const leadData = record.data as Partial<LeadData>;

  const fullName = typeof leadData?.fullName === 'string' ? leadData.fullName : null;
  const jobTitle = typeof leadData?.jobTitle === 'string' ? leadData.jobTitle : null;
  const companyName = typeof leadData?.companyName === 'string' ? leadData.companyName : null;
  const stage = typeof leadData?.stage === 'string' ? leadData.stage : null;
  const value = typeof leadData?.value === 'number' ? leadData.value : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {fullName || "Unknown Lead"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {jobTitle && (
              <span>{jobTitle}</span>
            )}
            {companyName && (
              <span>• {companyName}</span>
            )}
            {stage && (
              <span>• {stage}</span>
            )}
            {value !== null && (
              <span>• ${value.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
