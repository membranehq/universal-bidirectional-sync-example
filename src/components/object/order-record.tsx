import { Mail } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { ordersSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "@/models/types";

interface OrderRecordProps {
  record: IRecord;
}


type OrderData = z.infer<typeof ordersSchema>;

export function OrderRecord({ record }: OrderRecordProps) {
  const orderData = record.data as Partial<OrderData>;

  const orderName = typeof orderData?.name === 'string' ? orderData.name : null;
  const orderStatus = typeof orderData?.status === 'string' ? orderData.status : null;
  const totalAmount = typeof orderData?.totalAmount === 'number' ? orderData.totalAmount : null;
  const currency = typeof orderData?.currency === 'string' ? orderData.currency : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {orderName || "Unknown Order"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {orderStatus && (
              <span className="capitalize">{orderStatus}</span>
            )}
            {totalAmount !== null && currency && (
              <span>{currency} {totalAmount.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
