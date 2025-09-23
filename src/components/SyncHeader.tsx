import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppObjectBadge } from "@/components/ui/app-object-badge";
import { Button } from "@/components/ui/button";
import {
  Hash,
  RefreshCw,
  Loader2,
  Trash,
} from "lucide-react";
import Image from "next/image";
import { useResync } from "@/hooks/use-resync";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ISync } from "@/models/types";
import { MAX_RECORDS_COUNT } from "@/lib/sync-constants";
import { SyncSubscriptions } from "./subscription-details/SyncSubscriptions";


export function SyncHeader({
  sync,
}: {
  sync: ISync;
}) {
  const router = useRouter();

  const { resync, isResyncing: resyncing } = useResync(sync._id);

  const handleResync = async () => {
    await resync();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete this sync? This action cannot be undone and will remove all associated records.`);

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`/api/syncs/${sync._id}`);

      toast.success("Sync deleted");
      router.push("/");
    } catch (err: unknown) {
      let message = "Failed to delete sync";
      if (err instanceof Error) message = err.message;
      toast.error(message);
    }
  };

  const recordsCount = sync.recordCount || 0;

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          {sync.integrationLogoUri ? (
            <Image
              src={sync.integrationLogoUri}
              alt={sync.integrationName}
              width={48}
              height={48}
              className="rounded-lg border border-gray-200 bg-white w-12 h-12 object-contain"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
              {sync.integrationName?.[0] || "?"}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {sync.integrationName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {sync.integrationKey}
              </Badge>
              <AppObjectBadge appObjectKey={sync.appObjectKey} variant="outline" className="text-xs" />
              <StatusBadge
                status={sync.status}
                text={sync.status === "in_progress" ? `* Syncing first ${MAX_RECORDS_COUNT} records` : undefined}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              {recordsCount} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResync}
              disabled={resyncing}
              className="flex items-center gap-2"
            >
              {resyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {resyncing ? "Resyncing..." : "Resync"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="mt-8 mb-8">
        <SyncSubscriptions
          appObjectKey={sync.appObjectKey}
        />
      </div>
    </>
  );
}
