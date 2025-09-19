import { BarChart3 } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { dealstagesSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface DealStageRecordProps {
  record: IRecord;
}

type DealStageData = z.infer<typeof dealstagesSchema>;

export function DealStageRecord({ record }: DealStageRecordProps) {
  const dealStageData = record.data as Partial<DealStageData>;

  const stageName = typeof dealStageData?.name === 'string' ? dealStageData.name : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {stageName || "Unknown Deal Stage"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
