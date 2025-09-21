import { Percent } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { taxratesSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface TaxRateRecordProps {
  record: IRecord;
}

type TaxRateData = z.infer<typeof taxratesSchema>;

export function TaxRateRecord({ record }: TaxRateRecordProps) {
  const taxRateData = record.data as Partial<TaxRateData>;

  const rateName = typeof taxRateData?.name === 'string' ? taxRateData.name : null;
  const rate = typeof taxRateData?.effectiveTaxRate === 'number' ? taxRateData.effectiveTaxRate : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Percent className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {rateName || "Tax Rate"} {rate ? `(${(rate * 100).toFixed(1)}%)` : ""}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
