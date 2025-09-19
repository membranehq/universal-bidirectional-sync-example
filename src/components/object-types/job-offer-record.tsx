import { Award } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { joboffersSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface JobOfferRecordProps {
  record: IRecord;
}

type JobOfferData = z.infer<typeof joboffersSchema>;

export function JobOfferRecord({ record }: JobOfferRecordProps) {
  const jobOfferData = record.data as Partial<JobOfferData>;

  const status = typeof jobOfferData?.status === 'string' ? jobOfferData.status : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            Job Offer {status ? `(${status})` : ""}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
