import { Mail } from "lucide-react";
import type { IRecord } from "@/models/types";
import { RecordTypeWrapper } from "./RecordTypeWrapper";
import { emailSchema } from "@/lib/record-type-config";
import { z } from "zod";

interface EmailRecordProps {
  record: IRecord;
}

// Derive the type from the Zod schema
type EmailData = z.infer<typeof emailSchema>;

export function EmailRecord({ record }: EmailRecordProps) {
  const emailData = record.data as Partial<EmailData>;

  const emailSubject = typeof emailData?.subject === 'string' ? emailData.subject : null;

  return (
    <RecordTypeWrapper>
      <div className="flex items-center gap-2 min-w-0">
        <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="truncate block">
            {emailSubject || record.name || "No Subject"}
          </span>
        </div>
      </div>
    </RecordTypeWrapper>
  );
}
