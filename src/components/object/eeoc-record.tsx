import { Shield } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { eeocsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface EeocRecordProps {
  record: IRecord;
}

type EeocData = z.infer<typeof eeocsSchema>;

export function EeocRecord({ record }: EeocRecordProps) {
  const eeocData = record.data as Partial<EeocData>;

  const candidateId = typeof eeocData?.candidateId === 'string' ? eeocData.candidateId : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            EEOC {candidateId ? `(${candidateId})` : "Record"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
