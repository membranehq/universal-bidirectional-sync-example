import { List } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { contactlistsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface ContactListRecordProps {
  record: IRecord;
}

type ContactListData = z.infer<typeof contactlistsSchema>;

export function ContactListRecord({ record }: ContactListRecordProps) {
  const contactListData = record.data as Partial<ContactListData>;

  const listName = typeof contactListData?.name === 'string' ? contactListData.name : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <List className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {listName || "Unknown Contact List"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
