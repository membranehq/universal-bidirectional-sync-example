import useSWR from "swr";
import axios from "axios";

interface IntegrationTokenResponse {
  token: string;
}

export function useMembraneToken() {
  const { data, error, isLoading, mutate } = useSWR<IntegrationTokenResponse>(
    "/api/integration-token",
    async (url: string) => {
      const response = await axios.get(url);
      return response.data;
    }
  );

  return {
    token: data?.token,
    error,
    isLoading,
    mutate,
  };
}
