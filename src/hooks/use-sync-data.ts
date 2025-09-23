import useSWR from "swr";
import { useParams } from "next/navigation";
import axios from "axios";
import { ISync } from "@/models/types";

type SyncData = {
  data: {
    sync: ISync;
  };
};

export function useSyncData() {
  const { id } = useParams();

  const { data, error, isLoading, mutate } = useSWR<SyncData>(
    id ? [`/api/syncs/${id}`, "token"] : null,
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
    sync: data?.data?.sync,
    error,
    isLoading,
    mutate,
  };
}
