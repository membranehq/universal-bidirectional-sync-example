import { useState, useEffect } from "react";
import { useIntegrationApp } from "@integration-app/react";
import {  DataSource } from "@integration-app/sdk";

interface UseDataSourcesProps {
  integrationId: string | undefined;
}

interface UseDataSourcesReturn {
  data: DataSource[];
  isLoading: boolean;
}

export function useDataSources({
  integrationId,
}: UseDataSourcesProps): UseDataSourcesReturn {
  const [data, setData] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const integrationApp = useIntegrationApp();

  useEffect(() => {
    const fetchDataSources = async () => {
      if (!integrationId) {
        setData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const sources = await integrationApp.dataSources.findAll({
          integrationId: integrationId,
        });
        setData(sources);
      } catch (err) {
        console.error("Failed to fetch data sources:", err);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataSources();
  }, [integrationId, integrationApp]);

  return {
    data,
    isLoading,
  };
}
