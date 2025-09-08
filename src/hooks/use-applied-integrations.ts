import { useState, useEffect } from "react";
import { Integration, useIntegrationApp } from "@membranehq/react";

export function useDataSourceAppliedIntegrations(dataSourceKey: string | null) {
  const [appliedToIntegrations, setAppliedToIntegrations] = useState<
    Integration[]
  >([]);
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const integrationApp = useIntegrationApp();

  useEffect(() => {
    const fetchDataSource = async () => {
      if (!dataSourceKey) {
        setAppliedToIntegrations([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const dataSource = await integrationApp
          .dataSource({ key: dataSourceKey })
          .get();

        if (dataSource) {
          setAppliedToIntegrations(
            dataSource.appliedToIntegrations?.map(
              ({ integration }) => integration
            ) || []
          );
        } else {
          setAppliedToIntegrations([]);
        }
      } catch (err) {
        console.error("Failed to fetch data source:", err);
        setAppliedToIntegrations([]);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataSource();
  }, [dataSourceKey, integrationApp]);

  return {
    integrations: appliedToIntegrations || [],
    loading,
    error,
  };
}
