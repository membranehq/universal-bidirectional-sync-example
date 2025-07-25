"use client"

import { IntegrationAppProvider as Provider } from "@integration-app/react";
import { useAuth } from "@clerk/nextjs";

export function IntegrationAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken } = useAuth();

  const fetchToken = async () => {
    const token = await getToken();
    const response = await fetch("/api/integration-token", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch integration token");
    }
    return data.token;
  };

  return (
    <Provider
      fetchToken={fetchToken}>
      {children}
    </Provider>
  );
}
