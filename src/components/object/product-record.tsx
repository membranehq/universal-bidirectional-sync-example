import { IRecord } from "@/models/types";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { Package } from "lucide-react";
import { productsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";

interface ProductRecordProps {
  record: IRecord;
}


type ProductData = z.infer<typeof productsSchema>;

export function ProductRecord({ record }: ProductRecordProps) {
  const productData = record.data as Partial<ProductData>;

  const name = typeof productData?.name === 'string' ? productData.name : null;
  const code = typeof productData?.code === 'string' ? productData.code : null;
  const price = typeof productData?.price === 'number' ? productData.price : null;
  const type = typeof productData?.type === 'string' ? productData.type : null;
  const status = typeof productData?.status === 'string' ? productData.status : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Package className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {name || "Unknown Product"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {code && (
              <span>{code}</span>
            )}
            {price !== null && (
              <span>• ${price.toFixed(2)}</span>
            )}
            {type && (
              <span>• {type}</span>
            )}
            {status && (
              <span>• {status}</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
