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
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PullCountdown } from "./PullCountdown";
import { ExternalEventSubscription } from "@integration-app/sdk";
import { useMembraneToken } from "@/hooks/use-integration-token";

interface SubscriptionProps {
  subscription: ExternalEventSubscription | null;
  eventType: string;
  label: string;
  recordType: string;
}

export function Subscription({
  subscription,
  label,
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
      const response = await fetch(
        `https://api.integration.app/external-event-subscriptions/${subscription.id}/pull-events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to trigger pull events: ${response.status}`
        );
      }

      toast.success("Pull events triggered successfully!");
    } catch (error) {
      console.error("Failed to trigger pull events:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to trigger pull events"
      );
    } finally {
      setPulling(false);
    }
  };

  const getDetectionMethod = () => {
    if (isRealTime) {
      return {
        method: "Webhooks",
        url: "https://docs.integration.app/docs/data-collection-events-webhook",
      };
    } else if (requiresPull && subscription?.pullUpdatesIntervalSeconds) {
      return {
        method: "Pull",
        url: "https://docs.integration.app/docs/data-collection-events-custom-pull",
      };
    } else {
      return {
        method: "Full Scan",
        url: "https://docs.integration.app/docs/data-collection-events-full-scan",
      };
    }
  };

  const detectionMethod = getDetectionMethod();

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

          {/* Pull Button - Top Right Corner */}
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
                  href={detectionMethod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  <div className="text-xs cursor-pointer flex items-center gap-1">
                    {detectionMethod.method}
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
    </TooltipProvider>
  );
} 