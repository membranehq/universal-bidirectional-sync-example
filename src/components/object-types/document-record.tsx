import { FileText } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { documentsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface DocumentRecordProps {
  record: IRecord;
}

type DocumentData = z.infer<typeof documentsSchema>;

export function DocumentRecord({ record }: DocumentRecordProps) {
  const documentData = record.data as Partial<DocumentData>;

  const documentTitle = typeof documentData?.title === 'string' ? documentData.title : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {documentTitle || "Unknown Document"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
