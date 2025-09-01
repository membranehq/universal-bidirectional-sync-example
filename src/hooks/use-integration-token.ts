import useSWR from "swr";
import { fetchWithAuth } from "@/lib/fetch-utils";

interface IntegrationTokenResponse {
  token: string;
}

export function useMembraneToken() {
  const { data, error, isLoading, mutate } = useSWR<IntegrationTokenResponse>(
    "/api/integration-token",
    async (url: string) => {
      return fetchWithAuth(url);
    }
  );

  return {
    token: data?.token,
    error,
    isLoading,
    mutate,
  };
}
