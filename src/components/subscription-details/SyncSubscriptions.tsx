import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Subscription } from "./Subscription";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import appObjects from "@/lib/app-objects";
import { AppObjectKey } from "@/lib/app-objects-schemas";

interface SyncSubscriptionsProps {
  appObjectKey: AppObjectKey;
  syncId: string;
}

export function SyncSubscriptions({
  appObjectKey,
  syncId,
}: SyncSubscriptionsProps) {
  const { subscriptions, isLoading, error } = useSubscriptions();
  const [isMinimized, setIsMinimized] = useState(false);

  const eventTypes = [
    { key: "data-record-created", label: `${appObjects[appObjectKey]?.label} Created` },
    { key: "data-record-updated", label: `${appObjects[appObjectKey]?.label} Updated` },
    { key: "data-record-deleted", label: `${appObjects[appObjectKey]?.label} Deleted` },
  ] as const;

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Event Subscriptions</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          Failed to load subscriptions
        </div>
      </div>
    );
  }

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
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {eventTypes.map(({ key }) => (
              <div key={key} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="w-2 h-2 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3 h-3" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {eventTypes.map(({ key, label }) => (
              <Subscription
                key={key}
                subscription={subscriptions[key]}
                eventType={key}
                label={label}
                appObjectKey={appObjectKey}
                syncId={syncId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
