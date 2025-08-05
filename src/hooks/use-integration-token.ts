import useSWR from "swr";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { useClerkAuth } from "./use-auth";

interface IntegrationTokenResponse {
  token: string;
}

export function useMembraneToken() {
  const { getToken } = useClerkAuth();

  const { data, error, isLoading, mutate } = useSWR<IntegrationTokenResponse>(
    "/api/integration-token",
    async (url: string) => {
      return fetchWithAuth(url, getToken);
    }
  );

  return {
    token: data?.token,
    error,
    isLoading,
    mutate,
  };
}
