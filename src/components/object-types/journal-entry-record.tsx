import { BookOpen } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { journalentriesSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface JournalEntryRecordProps {
  record: IRecord;
}

type JournalEntryData = z.infer<typeof journalentriesSchema>;

export function JournalEntryRecord({ record }: JournalEntryRecordProps) {
  const journalEntryData = record.data as Partial<JournalEntryData>;

  const entryTitle = typeof journalEntryData?.title === 'string' ? journalEntryData.title :
    typeof journalEntryData?.number === 'string' ? journalEntryData.number : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {entryTitle || "Unknown Journal Entry"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
