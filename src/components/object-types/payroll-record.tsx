import { DollarSign } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { payrollsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface PayrollRecordProps {
  record: IRecord;
}

type PayrollData = z.infer<typeof payrollsSchema>;

export function PayrollRecord({ record }: PayrollRecordProps) {
  const payrollData = record.data as Partial<PayrollData>;

  const runType = typeof payrollData?.runType === 'string' ? payrollData.runType : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {runType || "Unknown Payroll"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
