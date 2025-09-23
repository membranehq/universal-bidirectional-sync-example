import useSWRMutation from "swr/mutation";
import axios from "axios";
import { toast } from "sonner";

type ResyncResponse = {
  success: boolean;
};

export function useResync(syncId: string) {
  const { trigger, isMutating } = useSWRMutation<ResyncResponse>(
    `/api/syncs/${syncId}/resync`,
    async (url: string) => {
      const response = await axios.post(
        url,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    }
  );

  const resync = async (): Promise<boolean> => {
    try {
      await trigger();
      toast.success("Resync triggered");
      return true;
    } catch (err: unknown) {
      let message = "Failed to resync";
      if (err instanceof Error) message = err.message;
      toast.error(message);
      return false;
    }
  };

  return {
    resync,
    isResyncing: isMutating,
  };
}
