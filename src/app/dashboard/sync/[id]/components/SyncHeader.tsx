import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Hash,
  Download,
  Clock,
  MoreVertical,
  RefreshCw,
  Loader2,
  Trash,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

import { useAuth } from "@clerk/nextjs";

import useSWRMutation from "swr/mutation";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Subscription } from "@/app/dashboard/sync/[id]/components/Subscription";
import { useState } from "react";
import { capitalize } from "@/lib/string-utils";
import { ISync, Subscriptions } from "@/models/types";

function SyncSubscriptions({
  subscriptions,
  recordType,
}: {
  recordType: string;
  subscriptions: Subscriptions;
}) {
  const [isMinimized, setIsMinimized] = useState(false);

  const eventTypes = [
    { key: "data-record-created", label: `${recordType} Created` },
    { key: "data-record-updated", label: `${recordType} Updated` },
    { key: "data-record-deleted", label: `${recordType} Deleted` },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Event Subscriptions</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center gap-2"
        >
          {isMinimized ? (
            <>
              <ChevronDown className="w-4 h-4" />
              Expand
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4" />
              Minimize
            </>
          )}
        </Button>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isMinimized ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
          }`}
      >
        <div className="grid grid-cols-3 gap-4">
          {eventTypes.map(({ key, label }) => (
            <Subscription
              key={key}
              subscription={subscriptions[key]}
              eventType={key}
              label={label}
              recordType={recordType}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SyncHeader({
  sync,
  subscriptions,
}: {
  sync: ISync;
  subscriptions: Subscriptions;
}) {
  const { getToken } = useAuth();
  const router = useRouter();

  const { trigger: triggerResync, isMutating: resyncing } = useSWRMutation(
    `/api/sync/${sync._id}/resync`,
    async (url: string) =>
      fetchWithAuth(url, getToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
  );

  const handleResync = async () => {
    try {
      await triggerResync();
      toast.success("Resync triggered!");
    } catch (err: unknown) {
      let message = "Failed to resync";
      if (err instanceof Error) message = err.message;
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/sync/${sync._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete sync");
      toast.success("Sync deleted");
      router.push("/dashboard");
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
              <Badge variant="outline" className="text-xs">
                {sync.recordType}
              </Badge>
              <StatusBadge status={sync.status} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              {recordsCount} records
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {sync.syncCount || 1} syncs
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {sync.updatedAt
                ? formatDistanceToNow(new Date(sync.updatedAt), {
                  addSuffix: true,
                })
                : "N/A"}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
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
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-600"
              >
                <Trash className="w-4 h-4" /> Delete Sync
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Subscription Details */}
      {subscriptions && (
        <div className="mt-8 mb-8">
          <SyncSubscriptions
            recordType={capitalize(sync.recordType)}
            subscriptions={subscriptions}
          />
        </div>
      )}
    </>
  );
}
