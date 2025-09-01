"use client";

import { useFieldMappingInstance } from "@membranehq/react";
import { Skeleton } from "@/components/ui/skeleton";
import { FormLabel } from "@/components/ui/form-label";
import { DataInput } from "@membranehq/react";
import { SectionWithStatus } from "./section-with-status";

interface CustomFieldMappingConfigurationProps {
  instanceKey: string;
  integrationKey?: string;
  fieldMappingKey: string;
}

export function CustomFieldMappingConfiguration({
  instanceKey,
  integrationKey,
  fieldMappingKey,
}: CustomFieldMappingConfigurationProps) {
  const { fieldMappingInstance, patch, loading, error } =
    useFieldMappingInstance({
      integrationKey: integrationKey,
      fieldMappingKey: fieldMappingKey,
      instanceKey: instanceKey,
      autoCreate: true,
    });

  if (loading) return <Skeleton className="h-10 w-2/3" />;
  if (error) return <div>Error: {error.message}</div>;
  if (!fieldMappingInstance) return null;

  return (
    <SectionWithStatus done={true}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between mb-1">
          <FormLabel
            label="Configure Field Mapping"
            tooltip="Customize how fields on the object map to fields on the the integration"
            size="sm"
          />
        </div>
        <DataInput
          schema={fieldMappingInstance.appSchema!}
          value={fieldMappingInstance.importValue}
          variablesSchema={fieldMappingInstance.externalSchema}
          onChange={(importValue: unknown) => patch({ importValue })}
        />
      </div>
    </SectionWithStatus>
  );
} 