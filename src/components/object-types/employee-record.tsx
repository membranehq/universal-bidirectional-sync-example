import { User } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { employeesSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface EmployeeRecordProps {
  record: IRecord;
}

type EmployeeData = z.infer<typeof employeesSchema>;

export function EmployeeRecord({ record }: EmployeeRecordProps) {
  const employeeData = record.data as Partial<EmployeeData>;

  const employeeName = typeof employeeData?.fullName === 'string' ? employeeData.fullName :
    typeof employeeData?.preferredName === 'string' ? employeeData.preferredName : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <User className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {employeeName || "Unknown Employee"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
