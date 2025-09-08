"use client";

import { useEffect } from "react";
import { useDataSourceInstance, DataSourceConfig, IntegrationElementProvider } from "@membranehq/react";
import { DataSourceInstance } from "@membranehq/sdk";
import { Skeleton } from "@/components/ui/skeleton";

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

  console.log("dataSourceInstance", dataSourceInstance);

  return (
    <IntegrationElementProvider
      integrationId={integrationKey}
      connectionId={connectionId}
    >
      <DataSourceConfig
        configureEvents={false}
        value={dataSourceInstance}
        onChange={(value) => patch(value)}
      />
    </IntegrationElementProvider >
  );
}
