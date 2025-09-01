"use client"

import { IntegrationAppProvider as Provider } from "@membranehq/react";

export function IntegrationAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const fetchToken = async () => {
    
    const response = await fetch("/api/integration-token");
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
