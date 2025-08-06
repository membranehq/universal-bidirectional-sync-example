import { useState, useEffect } from "react";
import { useIntegrationApp } from "@integration-app/react";
import { Integration, Connection } from "@integration-app/sdk";

interface UseIntegrationConnectionProps {
  selectedIntegration: Integration | null;
}

interface UseIntegrationConnectionReturn {
  data: Connection | null;
  isLoading: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
}

export function useIntegrationConnection({
  selectedIntegration,
}: UseIntegrationConnectionProps): UseIntegrationConnectionReturn {
  const [data, setData] = useState<Connection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const integrationApp = useIntegrationApp();

  useEffect(() => {
    const fetchConnection = async () => {
      if (!selectedIntegration) {
        setData(null);
        return;
      }

      setIsLoading(true);
      try {
        const connection = await integrationApp.connections.find({
          integrationKey: selectedIntegration.key,
        });
        if (connection.items.length > 0) {
          setData(connection.items[0]);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error("Failed to fetch connection:", err);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnection();
  }, [selectedIntegration, integrationApp]);

  const connect = async () => {
    if (!selectedIntegration?.key) return;

    setIsConnecting(true);
    try {
      const connection = await integrationApp
        .integration(selectedIntegration.key)
        .openNewConnection();
      if (connection) {
        setData(connection);
      }
    } catch (err) {
      console.error("Failed to connect:", err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    data,
    isLoading,
    isConnecting,
    connect,
  };
}
