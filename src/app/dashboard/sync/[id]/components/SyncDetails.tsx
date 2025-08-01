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
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import type { ISync } from "@/models/types";
import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ExternalEventSubscription } from "@integration-app/sdk";
import { PullCountdown } from "@/app/dashboard/sync/[id]/components/PullCountdown";
import { useState } from "react";
import { integrationAppClient } from "@/lib/integration-app-client";
import { singularize } from '../../../../../lib/pluralize-utils';
import { capitalize } from "@/lib/string-utils";

interface SyncDetailsProps {
  syncId: string;
}

// Component to render subscription details
function SubscriptionDetails({
  subscriptions,
  objectType
}: {
  objectType: string;
  subscriptions: {
    "data-record-created": ExternalEventSubscription | null;
    "data-record-updated": ExternalEventSubscription | null;
    "data-record-deleted": ExternalEventSubscription | null;
  }
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [pullingSubscriptions, setPullingSubscriptions] = useState<Set<string>>(new Set());
  const eventTypes = [
    { key: "data-record-created", label: `${objectType} Created` },
    { key: "data-record-updated", label: `${objectType} Updated` },
    { key: "data-record-deleted", label: `${objectType} Deleted` },
  ] as const;

  const handlePull = async (subscriptionId: string) => {
    if (!subscriptionId) return;

    setPullingSubscriptions(prev => new Set(prev).add(subscriptionId));

    try {
      await integrationAppClient.triggerPullEvents(subscriptionId);
      toast.success("Pull events triggered successfully!");
    } catch (error) {
      console.error("Failed to trigger pull events:", error);
      toast.error(error instanceof Error ? error.message : "Failed to trigger pull events");
    } finally {
      setPullingSubscriptions(prev => {
        const newSet = new Set(prev);
        newSet.delete(subscriptionId);
        return newSet;
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className=" font-semibold text-gray-900">Event Subscriptions</h3>
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
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
            }`}
        >
          <div className="grid grid-cols-3 gap-4">
            {eventTypes.map(({ key, label }) => {
              const subscription = subscriptions[key];
              const isActive = subscription?.status === "subscribed";
              const hasError = subscription?.status === "error";
              const isRealTime = subscription?.isRealTime || false;
              const requiresPull = subscription?.requiresPull || false;
              const requiresFullSync = subscription?.requiresFullSync || false;

              return (
                <div key={key} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <div className="flex items-center gap-2">
                        {hasError && subscription?.error ? (
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <div
                                className="w-3 h-3 rounded-full bg-red-500 cursor-help"
                              />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="font-medium">Error:</span>
                              </div>
                              <p className="mt-1 text-sm">
                                {typeof subscription.error === 'object' && subscription.error.message
                                  ? subscription.error.message
                                  : String(subscription.error)}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div
                            className={`w-3 h-3 rounded-full ${isActive
                              ? "bg-green-500"
                              : "bg-gray-400"
                              }`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Pull Button - Top Right Corner */}
                    {(requiresPull || requiresFullSync) && subscription?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePull(subscription.id!)}
                        disabled={pullingSubscriptions.has(subscription.id)}
                        className="flex items-center gap-2"
                      >
                        {pullingSubscriptions.has(subscription.id) ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        {pullingSubscriptions.has(subscription.id) ? "Pulling..." : "Pull"}
                      </Button>
                    )}
                  </div>

                  {subscription && (
                    <div className="space-y-3">
                      {/* Detection Method and Next Pull */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          {isRealTime ? (
                            <>
                              <Hash className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">Detection:</span>
                              <a
                                href="https://docs.integration.app/docs/data-collection-events-webhook"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                <div className="text-xs cursor-pointer flex items-center gap-1">
                                  Webhooks
                                  <ExternalLink className="w-3 h-3" />
                                </div>
                              </a>
                            </>
                          ) : requiresPull && subscription.pullUpdatesIntervalSeconds && subscription.nextPullEventsTimestamp ? (
                            <>
                              <Hash className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">Detection:</span>
                              <a
                                href="https://docs.integration.app/docs/data-collection-events-custom-pull"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                <div className="text-xs cursor-pointer flex items-center gap-1">
                                  Pull
                                  <ExternalLink className="w-3 h-3" />
                                </div>
                              </a>
                            </>
                          ) : (
                            <>
                              <Hash className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">Detection:</span>
                              <a
                                href="https://docs.integration.app/docs/data-collection-events-full-scan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >

                                <div className="text-xs cursor-pointer flex items-center gap-1">
                                  Full Scan
                                  <ExternalLink className="w-3 h-3" />
                                </div>
                              </a>
                            </>
                          )}
                        </div>

                        {/* Next Pull Time Countdown */}
                        {requiresPull && subscription.pullUpdatesIntervalSeconds && subscription.nextPullEventsTimestamp && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Next Pull:</span>
                            <span className="font-medium">
                              <PullCountdown
                                nextPullTime={subscription.nextPullEventsTimestamp}
                                pullInterval={subscription.pullUpdatesIntervalSeconds}
                              />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Full Sync Interval */}
                      {requiresFullSync && subscription.fullSyncIntervalSeconds && (
                        <div className="flex items-center gap-2 text-sm">
                          <RotateCcw className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Full Sync Interval:</span>
                          <span className="font-medium">
                            {subscription.fullSyncIntervalSeconds} seconds
                          </span>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export function SyncDetails({ syncId }: SyncDetailsProps) {
  const { getToken } = useAuth();
  const router = useRouter();

  const { data: syncData, error: syncError, mutate: mutateSync } = useSWR<{
    data: {
      sync: ISync, subscriptions: {
        "data-record-created": ExternalEventSubscription | null;
        "data-record-updated": ExternalEventSubscription | null;
        "data-record-deleted": ExternalEventSubscription | null;
      }
    };
  }>(
    [`/api/sync/${syncId}`, "token"],
    async ([url]) => fetchWithAuth(url, getToken),
    {
      refreshInterval: 3000,
    }
  );



  const { trigger: triggerResync, isMutating: resyncing } = useSWRMutation(
    `/api/sync/${syncId}/resync`,
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
      await mutateSync();
    } catch (err: unknown) {
      let message = "Failed to resync";
      if (err instanceof Error) message = err.message;
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/sync/${syncId}`, {
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

  if (syncError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <span>Failed to load sync details</span>
      </div>
    );
  }

  if (!syncData?.data?.sync) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <span>Sync not found.</span>
      </div>
    );
  }

  const sync = syncData.data.sync;
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
                {sync.dataSourceKey}
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

      {/* Error Display */}
      {sync.error && (
        <div className="flex items-center justify-between mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Sync Error:</span> {sync.error}
          </div>
          <Button
            onClick={handleResync}
            disabled={resyncing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
          >
            {resyncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {resyncing ? "Resyncing..." : "Resync"}
          </Button>
        </div>
      )}

      {/* Subscription Details */}
      {syncData?.data?.subscriptions && (
        <div className="mt-8 mb-8">
          <SubscriptionDetails
            objectType={capitalize(singularize(sync.dataSourceKey))}
            subscriptions={syncData.data.subscriptions} />
        </div>
      )}
    </>
  );
} 