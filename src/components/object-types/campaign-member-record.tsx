import { Users } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { campaignmembersSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface CampaignMemberRecordProps {
  record: IRecord;
}

type CampaignMemberData = z.infer<typeof campaignmembersSchema>;

export function CampaignMemberRecord({ record }: CampaignMemberRecordProps) {
  const campaignMemberData = record.data as Partial<CampaignMemberData>;

  const memberName = typeof campaignMemberData?.fullName === 'string' ? campaignMemberData.fullName : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {memberName || "Unknown Campaign Member"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
