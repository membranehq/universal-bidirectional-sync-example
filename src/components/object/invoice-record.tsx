import { IRecord } from "@/models/types";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { Receipt } from "lucide-react";
import { invoicesSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";

interface InvoiceRecordProps {
  record: IRecord;
}


type InvoiceData = z.infer<typeof invoicesSchema>;

export function InvoiceRecord({ record }: InvoiceRecordProps) {
  const invoiceData = record.data as Partial<InvoiceData>;

  const name = typeof invoiceData?.name === 'string' ? invoiceData.name : null;
  const number = typeof invoiceData?.number === 'string' ? invoiceData.number : null;
  const totalAmount = typeof invoiceData?.totalAmount === 'number' ? invoiceData.totalAmount : null;
  const currency = typeof invoiceData?.currency === 'string' ? invoiceData.currency : null;
  const status = typeof invoiceData?.status === 'string' ? invoiceData.status : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Receipt className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {name || "Unknown Invoice"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {number && (
              <span>#{number}</span>
            )}
            {totalAmount !== null && currency && (
              <span>• {currency} {totalAmount.toFixed(2)}</span>
            )}
            {status && (
              <span>• {status}</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
