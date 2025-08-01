"use client";

import { Plus, Edit, Trash2, RefreshCw, Database, Hash } from "lucide-react";
import type { IRecord, ISync, ISyncActivity, SyncActivityType } from "@/models/types";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/fetch-utils";

interface SyncActivitiesProps {
  records?: (IRecord & { _id: string })[];
  sync: ISync & { _id: string };
}

export function SyncActivities({ sync }: SyncActivitiesProps) {
  const { getToken } = useAuth();

  // Fetch sync activities
  const { data: activitiesData, error: activitiesError, isLoading: activitiesLoading } = useSWR(
    `/api/sync/${sync._id}/activities`,
    async (url) => {
      const token = await getToken();
      return fetchWithAuth(url, () => Promise.resolve(token));
    },
    {
      refreshInterval: 5000
    }
  );

  const activities = activitiesData?.activities || [];

  const getActivityIcon = (type: SyncActivityType) => {
    switch (type) {
      case 'sync_created':
        return <Plus className="w-4 h-4" />;
      case 'sync_syncing':
        return <RefreshCw className="w-4 h-4" />;
      case 'sync_completed':
        return <Database className="w-4 h-4" />;
      case 'sync_resync_triggered':
        return <RefreshCw className="w-4 h-4" />;
      case 'event_record_created':
        return <Plus className="w-4 h-4" />;
      case 'event_record_updated':
        return <Edit className="w-4 h-4" />;
      case 'event_record_deleted':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getActivityTitle = (type: SyncActivityType) => {
    switch (type) {
      case 'sync_created':
        return 'Sync Created';
      case 'sync_syncing':
        return 'Sync in Progress';
      case 'sync_completed':
        return 'Sync Completed';
      case 'sync_resync_triggered':
        return 'Resync Triggered';
      case 'event_record_created':
        return 'Record Created Event Received';
      case 'event_record_updated':
        return 'Record Updated Event Received';
      case 'event_record_deleted':
        return 'Record Deleted Event Received';
    }
  };

  const getActivityColor = () => {
    return 'bg-muted-foreground';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) {
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  if (activitiesLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-medium text-foreground">Activity</h3>
        <Loader message="Loading activities..." />
      </div>
    );
  }

  if (activitiesError) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-medium text-foreground">Activity</h3>
        <div className="text-xs text-muted-foreground text-center py-4">
          Failed to load activities
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-medium text-foreground">Activity</h3>

      {activities.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-4">
          No recent activity
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {activities.map((activity: ISyncActivity) => (
              <div key={activity._id} className="relative flex items-start gap-3">
                {/* Timeline dot */}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-background",
                  getActivityColor()
                )}>
                  <div className="text-white">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-foreground">
                      {getActivityTitle(activity.type)}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {formatTimeAgo(new Date(activity.createdAt))}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground mt-1 space-y-1">
                    {activity.metadata && typeof activity.metadata === 'object' && 'recordId' in activity.metadata && (
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {String(activity.metadata.recordId)}
                      </div>
                    )}
                    {activity.metadata && (
                      <>
                        {typeof activity.metadata.totalDocumentsSynced === 'number' && (
                          <div>{activity.metadata.totalDocumentsSynced} records</div>
                        )}
                        {typeof activity.metadata.fieldsCount === 'number' && (
                          <div>{activity.metadata.fieldsCount} fields</div>
                        )}
                        {typeof activity.metadata.error === 'string' && (
                          <div>Error: {activity.metadata.error}</div>
                        )}
                        {typeof activity.metadata.differences === 'object' && (
                          <div>Changes detected</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 