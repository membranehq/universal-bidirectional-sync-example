import { Megaphone } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { campaignsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface CampaignRecordProps {
  record: IRecord;
}

type CampaignData = z.infer<typeof campaignsSchema>;

export function CampaignRecord({ record }: CampaignRecordProps) {
  const campaignData = record.data as Partial<CampaignData>;

  const campaignName = typeof campaignData?.name === 'string' ? campaignData.name : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Megaphone className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {campaignName || "Unknown Campaign"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
