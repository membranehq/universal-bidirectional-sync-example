import { Package } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { dealproductsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface DealProductRecordProps {
  record: IRecord;
}

type DealProductData = z.infer<typeof dealproductsSchema>;

export function DealProductRecord({ record }: DealProductRecordProps) {
  const dealProductData = record.data as Partial<DealProductData>;

  const productName = typeof dealProductData?.name === 'string' ? dealProductData.name : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Package className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {productName || "Unknown Deal Product"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
