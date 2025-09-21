import { Users } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { contactsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "@/models/types";

interface ContactRecordProps {
  record: IRecord;
}


type ContactData = z.infer<typeof contactsSchema>;

export function ContactRecord({ record }: ContactRecordProps) {
  const contactData = record.data as Partial<ContactData>;

  const fullName = typeof contactData?.fullName === 'string' ? contactData.fullName : null;
  const primaryEmail = typeof contactData?.primaryEmail === 'string' ? contactData.primaryEmail : null;
  const jobTitle = typeof contactData?.jobTitle === 'string' ? contactData.jobTitle : null;
  const companyName = typeof contactData?.companyName === 'string' ? contactData.companyName : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {fullName || "Unknown Contact"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {jobTitle && (
              <span>{jobTitle}</span>
            )}
            {companyName && (
              <span>• {companyName}</span>
            )}
            {primaryEmail && (
              <span>• {primaryEmail}</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
