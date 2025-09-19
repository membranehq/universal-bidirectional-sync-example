import { FileMinus } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { creditnotesSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface CreditNoteRecordProps {
  record: IRecord;
}

type CreditNoteData = z.infer<typeof creditnotesSchema>;

export function CreditNoteRecord({ record }: CreditNoteRecordProps) {
  const creditNoteData = record.data as Partial<CreditNoteData>;

  const creditNoteNumber = typeof creditNoteData?.number === 'string' ? creditNoteData.number : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <FileMinus className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {creditNoteNumber || "Unknown Credit Note"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
