"use client";

import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { IRecord } from "@/models/types";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import { fetchWithAuth } from "@/lib/utils";

export default function SyncDetailsPage() {
  const { id } = useParams();
  const { getToken } = useAuth();

  // SWR for sync details
  const { data, error, isLoading, mutate } = useSWR(
    id ? [`/api/sync/${id}`, "token"] : null,
    async ([url]) => fetchWithAuth(url, getToken),
    {
      refreshInterval: 3000,
    }
  );

  // SWR mutation for resync
  const { trigger: triggerResync, isMutating: resyncing } = useSWRMutation(
    id ? `/api/sync/${id}/resync` : null,
    async (url: string) =>
      fetchWithAuth(url, getToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
  );

  if (isLoading) return <div>Loading sync details...</div>;
  if (error)
    return <div className="text-red-500">Failed to load sync details</div>;
  if (!data?.data?.sync) return <div>Sync not found.</div>;

  const { sync, records } = data.data;

  const handleResync = async () => {
    try {
      const result = await triggerResync();
      toast.success(`Resynced! ${result.totalDocumentsSynced} records synced.`);
      await mutate();
    } catch (err: unknown) {
      let message = "Failed to resync";
      if (err instanceof Error) message = err.message;
      toast.error(message);
    }
  };

  return (
    <div className="w-full mt-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="inline-block mb-4">
        <button className="px-4 py-2 rounded bg-muted border border-border hover:bg-accent transition-colors text-sm font-medium">
          ← Back to Dashboard
        </button>
      </Link>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Sync Details</h2>
        <button
          className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-60"
          onClick={handleResync}
          disabled={resyncing}
        >
          {resyncing ? "Resyncing..." : "Resync"}
        </button>
      </div>
      <Card className="p-4 mb-6">
        <div>
          <span className="font-medium">Integration:</span>{" "}
          {sync.integrationKey}
        </div>
        <div>
          <span className="font-medium">Data Source:</span> {sync.dataSourceKey}
        </div>
        <div>
          <span className="font-medium">Status:</span> {sync.status}
        </div>
        <div>
          <span className="font-medium">Created:</span>{" "}
          {sync.createdAt ? new Date(sync.createdAt).toLocaleString() : "N/A"}
        </div>
        <div>
          <span className="font-medium">Updated:</span>{" "}
          {sync.updatedAt ? new Date(sync.updatedAt).toLocaleString() : "N/A"}
        </div>
        {sync.error && (
          <div className="text-red-500">
            <span className="font-medium">Error:</span> {sync.error}
          </div>
        )}
      </Card>
      <h3 className="text-md font-semibold mb-2">Records</h3>
      {records.length === 0 ? (
        <div>No records found for this sync.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {records.map((record: IRecord & { _id: string }, idx: number) => (
            <Card key={record._id || idx} className="p-3 text-sm">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(record.data, null, 2)}
              </pre>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
