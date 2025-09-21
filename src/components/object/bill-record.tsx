import { Receipt } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { billsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface BillRecordProps {
  record: IRecord;
}

type BillData = z.infer<typeof billsSchema>;

export function BillRecord({ record }: BillRecordProps) {
  const billData = record.data as Partial<BillData>;

  const billName = typeof billData?.name === 'string' ? billData.name :
    typeof billData?.number === 'string' ? billData.number : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Receipt className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {billName || "Unknown Bill"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
