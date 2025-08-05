import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { ISync, Subscriptions } from "@/models/types";

type SyncData = {
  data: {
    sync: ISync;
    subscriptions: Subscriptions;
  };
};

export function useSyncData() {
  const { id } = useParams();
  const { getToken } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<SyncData>(
    id ? [`/api/sync/${id}`, "token"] : null,
    async ([url]) => fetchWithAuth(url, getToken),
    {
      refreshInterval: 3000,
      revalidateOnFocus: false,
    }
  );

  return {
    sync: data?.data?.sync,
    subscriptions: data?.data?.subscriptions,
    error,
    isLoading,
    mutate,
  };
}
