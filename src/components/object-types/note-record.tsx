import { IRecord } from "@/models/types";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { StickyNote } from "lucide-react";
import { notesSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";

interface NoteRecordProps {
  record: IRecord;
}


type NoteData = z.infer<typeof notesSchema>;

export function NoteRecord({ record }: NoteRecordProps) {
  const noteData = record.data as Partial<NoteData>;

  const title = typeof noteData?.title === 'string' ? noteData.title : null;
  const status = typeof noteData?.status === 'string' ? noteData.status : null;
  const content = typeof noteData?.content === 'string' ? noteData.content : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <StickyNote className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {title || "Unknown Note"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {status && (
              <span>{status}</span>
            )}
            {content && (
              <span className="truncate">• {content.substring(0, 50)}{content.length > 50 ? '...' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
