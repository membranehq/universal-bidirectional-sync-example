import { Building } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { companiesSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "@/models/types";

interface CompanyRecordProps {
  record: IRecord;
}

type CompanyData = z.infer<typeof companiesSchema>;

export function CompanyRecord({ record }: CompanyRecordProps) {
  const companyData = record.data as Partial<CompanyData>;

  const companyName = typeof companyData?.name === 'string' ? companyData.name : null;
  const industry = typeof companyData?.industry === 'string' ? companyData.industry : null;
  const numberOfEmployees = typeof companyData?.numberOfEmployees === 'number' ? companyData.numberOfEmployees : null;
  const websiteUrl = typeof companyData?.websiteUrl === 'string' ? companyData.websiteUrl : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Building className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {companyName || "Unknown Company"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {industry && (
              <span>{industry}</span>
            )}
            {numberOfEmployees !== null && (
              <span>• {numberOfEmployees} employees</span>
            )}
            {websiteUrl && (
              <span className="truncate">• {websiteUrl}</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
