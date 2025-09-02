"use client";

import { useEffect } from "react";
import {
  useIntegrationApp,
  useDataSourceInstance,
  IntegrationAppConnectionProvider,
  DataSourceConfig,
} from "@membranehq/react";
import { DataSourceInstance } from "@membranehq/sdk";
import { Skeleton } from "@/components/ui/skeleton";
import { FormLabel } from "@/components/ui/form-label";
import { DataInput } from "@membranehq/react";
import { SectionWithStatus } from "./section-with-status";

interface CustomDataSourceConfigurationProps {
  instanceKey: string;
  integrationKey?: string;
  dataSourceKey: string;
  connectionId: string;
  onDataSourceInstanceChange: (dataSourceInstance: DataSourceInstance) => void;
}

export function CustomDataSourceConfiguration({
  instanceKey,
  integrationKey,
  dataSourceKey,
  connectionId,
  onDataSourceInstanceChange,
}: CustomDataSourceConfigurationProps) {
  const client = useIntegrationApp();

  const { dataSourceInstance, loading, error, patch } = useDataSourceInstance({
    integrationKey: integrationKey,
    dataSourceKey: dataSourceKey,
    instanceKey: instanceKey,
    autoCreate: true,
  });

  useEffect(() => {
    if (dataSourceInstance) {
      onDataSourceInstanceChange(dataSourceInstance);
    }
  }, [dataSourceInstance, onDataSourceInstanceChange]);

  if (loading) return <Skeleton className="h-10 w-2/3" />;
  if (error) return <div>Error: {error.message}</div>;
  if (!dataSourceInstance) return null;
  if (
    dataSourceInstance?.collectionParameters &&
    !Object.keys(dataSourceInstance?.collectionParameters).length
  )
    return null;

  const hasRequiredParameters =
    (dataSourceInstance?.collectionSpec?.parametersSchema?.required?.length ||
      0) > 0;

  const requiredFieldsAreFilled = false;


  // Render null until we fix the issue with the data source config
  return null

  return (
    <IntegrationAppConnectionProvider connectionId={connectionId}>
      <SectionWithStatus
        done={hasRequiredParameters ? requiredFieldsAreFilled : true}
      >
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <FormLabel
              label="Configure Object"
              tooltip="Configure any required parameters for the selected data source."
              size="sm"
              className="mb-1"
            />
            {hasRequiredParameters && (
              <span className="text-xs font-semibold text-amber-500 mb-1 ">
                Has Required Parameters
              </span>
            )}
          </div>
          <DataSourceConfig
            configureEvents={true}
            value={dataSourceInstance}
            onChange={(value) => patch(value)}
          />
        </div>
      </SectionWithStatus>
    </IntegrationAppConnectionProvider>
  );
}
