import { IRecord } from "@/models/types";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { Target } from "lucide-react";
import { dealsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";

interface DealRecordProps {
  record: IRecord;
}


type DealData = z.infer<typeof dealsSchema>;

export function DealRecord({ record }: DealRecordProps) {
  const dealData = record.data as Partial<DealData>;

  const name = typeof dealData?.name === 'string' ? dealData.name : null;
  const amount = typeof dealData?.amount === 'number' ? dealData.amount : null;
  const currency = typeof dealData?.currency === 'string' ? dealData.currency : null;
  const stage = typeof dealData?.stage === 'string' ? dealData.stage : null;
  const probability = typeof dealData?.probability === 'number' ? dealData.probability : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {name || "Unknown Deal"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {amount !== null && currency && (
              <span>{currency} {amount.toLocaleString()}</span>
            )}
            {stage && (
              <span>• {stage}</span>
            )}
            {probability !== null && (
              <span>• {probability}%</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
