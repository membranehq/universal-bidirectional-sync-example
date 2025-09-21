import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Hash,
  Clock,
  RefreshCw,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PullCountdown } from "./PullCountdown";
import { ExternalEventSubscription } from "@membranehq/sdk";
import { useMembraneToken } from "@/hooks/use-integration-token";
import axios from "axios";
import { mutate } from "swr";
import { AppObjectKey } from "@/lib/app-objects-schemas";

interface SubscriptionProps {
  subscription: ExternalEventSubscription | null;
  eventType: string;
  label: string;
  appObjectKey: AppObjectKey;
  syncId: string;
}

export function Subscription({
  subscription,
  label,
  syncId,
}: SubscriptionProps) {
  const [pulling, setPulling] = useState(false);
  const isActive = subscription?.status === "subscribed";
  const hasError = subscription?.status === "error";
  const isRealTime = subscription?.isRealTime || false;
  const requiresPull = subscription?.requiresPull || false;
  const requiresFullSync = subscription?.requiresFullSync || false;
  const { token } = useMembraneToken();

  const handlePull = async () => {
    if (!subscription?.id) return;

    setPulling(true);

    try {
      await axios.post(
        `https://api.integration.app/external-event-subscriptions/${subscription.id}/pull-events`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Pull events triggered successfully!");

      mutate(`/api/sync/${syncId}`);
    } catch (error) {
      toast.error("Failed to trigger pull events");
      console.error("Failed to trigger pull events", error);
    } finally {
      setPulling(false);
    }
  };

  const getEventDetectionMethod = () => {
    if (isRealTime) {
      return {
        method: "Webhooks",
        url: "https://docs.integration.app/docs/data-collection-events-webhook",
      };
    } else if (requiresFullSync && subscription?.fullSyncIntervalSeconds) {
      return {
        method: "Full Scan",
        url: "https://docs.integration.app/docs/data-collection-events-full-scan",
      };
    } else {
      return {
        method: "Pull",
        url: "https://docs.integration.app/docs/data-collection-events-custom-pull",
      };
    }
  };

  const eventDetectionMethod = getEventDetectionMethod();

  return (
    <TooltipProvider>
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <div className="flex items-center gap-2">
              {hasError && subscription?.error ? (
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className="w-3 h-3 rounded-full bg-red-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Error:</span>
                    </div>
                    <p className="mt-1 text-sm">
                      {typeof subscription.error === "object" &&
                        subscription.error.message
                        ? subscription.error.message
                        : String(subscription.error)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div
                  className={`w-3 h-3 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"
                    }`}
                />
              )}
            </div>
          </div>

          {(requiresPull || requiresFullSync) && subscription?.id && (
            <Button
              size="sm"
              variant="outline"
              onClick={handlePull}
              disabled={pulling}
              className="flex items-center gap-2"
            >
              {pulling ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              {pulling ? "Pulling..." : "Pull"}
            </Button>
          )}
        </div>

        {subscription && (
          <div className="space-y-3">
            {/* Detection Method and Next Pull */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Detection:</span>
                <a
                  href={eventDetectionMethod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  <div className="text-xs cursor-pointer flex items-center gap-1">
                    {eventDetectionMethod.method}
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </a>
              </div>

              {/* Next Pull Time Countdown */}
              {requiresPull &&
                subscription.pullUpdatesIntervalSeconds &&
                subscription.nextPullEventsTimestamp && (
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
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
