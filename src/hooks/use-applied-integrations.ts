import { useState, useEffect } from "react";
import { Integration, useIntegrationApp } from "@membranehq/react";

export function useDataSourceAppliedIntegrations(dataSourceKey: string | null) {
  const [appliedToIntegrations, setAppliedToIntegrations] = useState<
    Integration[]
  >([]);
  const [loading, setIsLoading] = useState(false);
  const integrationApp = useIntegrationApp();

  useEffect(() => {
    const fetchDataSource = async () => {
      if (!dataSourceKey) {
        setAppliedToIntegrations([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataSource();
  }, [dataSourceKey, integrationApp]);

  return {
    integrations: appliedToIntegrations || [],
    loading,
  };
}
