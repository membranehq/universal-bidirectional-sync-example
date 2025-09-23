import useSWR from "swr";
import { useParams } from "next/navigation";
import axios from "axios";
import { Subscriptions } from "@/models/types";

type SubscriptionsData = {
  data: Subscriptions;
};

export function useSubscriptions() {
  const { id } = useParams();

  const { data, error, isLoading, mutate } = useSWR<SubscriptionsData>(
    id ? [`/api/syncs/${id}/subscriptions`, "token"] : null,
    async ([url]) => {
      const response = await axios.get(url);
      return response.data;
    },
    {
      refreshInterval: 3000,
      revalidateOnFocus: false,
    }
  );

  return {
    subscriptions: data?.data || {
      "data-record-created": null,
      "data-record-updated": null,
      "data-record-deleted": null,
    },
    error,
    isLoading,
    mutate,
  };
}
