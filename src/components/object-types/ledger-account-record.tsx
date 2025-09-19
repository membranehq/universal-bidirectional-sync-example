import { Database } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { ledgeraccountsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface LedgerAccountRecordProps {
  record: IRecord;
}

type LedgerAccountData = z.infer<typeof ledgeraccountsSchema>;

export function LedgerAccountRecord({ record }: LedgerAccountRecordProps) {
  const ledgerAccountData = record.data as Partial<LedgerAccountData>;

  const accountName = typeof ledgerAccountData?.name === 'string' ? ledgerAccountData.name : null;
  const accountCode = typeof ledgerAccountData?.code === 'string' ? ledgerAccountData.code : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Database className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {accountName || "Unknown Account"} {accountCode ? `(${accountCode})` : ""}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
