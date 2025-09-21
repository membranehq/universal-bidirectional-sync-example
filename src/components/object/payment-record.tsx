import { CreditCard } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { paymentsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface PaymentRecordProps {
  record: IRecord;
}

type PaymentData = z.infer<typeof paymentsSchema>;

export function PaymentRecord({ record }: PaymentRecordProps) {
  const paymentData = record.data as Partial<PaymentData>;

  const paymentAmount = typeof paymentData?.totalAmount === 'number' ? paymentData.totalAmount : null;
  const paymentCurrency = typeof paymentData?.currency === 'string' ? paymentData.currency : 'USD';

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {paymentAmount ? `${paymentCurrency} ${paymentAmount.toFixed(2)}` : "Unknown Payment"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
