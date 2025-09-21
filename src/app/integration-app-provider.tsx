"use client"

import { IntegrationAppProvider as Provider } from "@membranehq/react";
import axios from "axios";

export function IntegrationAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const fetchToken = async () => {
    try {
      const response = await axios.get("/api/integration-token");
      return response.data.token;
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to fetch integration token";
      throw new Error(errorMessage);
    }
  };

  return (
    <Provider
      fetchToken={fetchToken}>
      {children}
    </Provider>
  );
}
