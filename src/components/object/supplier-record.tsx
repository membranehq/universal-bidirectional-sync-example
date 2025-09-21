import { Truck } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { suppliersSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface SupplierRecordProps {
  record: IRecord;
}

type SupplierData = z.infer<typeof suppliersSchema>;

export function SupplierRecord({ record }: SupplierRecordProps) {
  const supplierData = record.data as Partial<SupplierData>;

  const supplierName = typeof supplierData?.name === 'string' ? supplierData.name :
    typeof supplierData?.companyName === 'string' ? supplierData.companyName : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {supplierName || "Unknown Supplier"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
