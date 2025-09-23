"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Plus, Edit, Trash2, RefreshCw, Database, Hash } from "lucide-react";
import type { IRecord, ISyncActivity, SyncActivityType, SyncActivityMetadata } from "@/models/types";
import useSWR from "swr";
import axios from "axios";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/cn";

interface SyncActivitiesProps {
  records?: (IRecord & { _id: string })[];
  syncId: string;
}

export const SyncActivities = memo(function SyncActivities({ syncId }: SyncActivitiesProps) {
  const [newActivityIds, setNewActivityIds] = useState<Set<string>>(new Set());
  const previousActivitiesRef = useRef<ISyncActivity[]>([]);

  const { data: activitiesData, error: activitiesError, isLoading: activitiesLoading, isValidating, mutate } = useSWR(
    `/api/syncs/${syncId}/activities`,
    async (url) => {
      const response = await axios.get(url);
      return response.data;
    },
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
    }
  );

  const activities = activitiesData?.activities || [];

  // Track new activities and apply animation
  useEffect(() => {
    if (activities.length > 0 && previousActivitiesRef.current.length > 0) {
      const previousActivityIds = new Set(previousActivitiesRef.current.map((a: ISyncActivity) => a._id));

      // Find new activities
      const newIds = activities
        .filter((activity: ISyncActivity) => !previousActivityIds.has(activity._id))
        .map((activity: ISyncActivity) => activity._id);

      if (newIds.length > 0) {
        setNewActivityIds(new Set(newIds));

        // Remove animation after 3 seconds
        setTimeout(() => {
          setNewActivityIds(new Set());
        }, 3000);
      }
    }

    previousActivitiesRef.current = activities;
  }, [activities]);

  const getActivityIcon = (type: SyncActivityType) => {
    switch (type) {
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
      case 'sync_syncing':
        return 'Sync in Progress';
      case 'sync_pull_failed':
        return 'Sync Failed';
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
      default:
        return 'Activity';
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

  const renderMetadata = (metadata: SyncActivityMetadata) => {
    return (
      <div className="text-xs text-muted-foreground mt-1 space-y-1">
        {metadata.recordId && (
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {metadata.recordId}
          </div>
        )}
        {metadata.totalDocumentsSynced !== undefined && (
          <div>{metadata.totalDocumentsSynced} records</div>
        )}
        {metadata.fieldsCount !== undefined && (
          <div>{metadata.fieldsCount} fields</div>
        )}
        {metadata.error && (
          <div>Error: {metadata.error}</div>
        )}
        {metadata.differences && (
          <div>Changes detected</div>
        )}
      </div>
    );
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
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-foreground">Activities</h3>
        <button
          onClick={() => mutate()}
          disabled={isValidating}
          className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh activities"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isValidating && "animate-spin")} />
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center animate-pulse-gentle">
              <Database className="w-6 h-6 text-muted-foreground animate-bounce-subtle" />
            </div>
            <div className="space-y-1 animate-fade-in-up">
              <p className="text-sm font-medium text-foreground">No activities yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Activities will appear here when data changes are detected and synced
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {activities.map((activity: ISyncActivity) => (
              <div
                key={activity._id}
                className={cn(
                  "relative flex items-start gap-3 transition-all duration-1000 ease-out",
                  newActivityIds.has(activity._id) && "animate-highlight"
                )}
              >
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

                  {activity.metadata && renderMetadata(activity.metadata)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes highlight {
          0% {
            background-color: rgba(59, 130, 246, 0.15);
            border: 1px solid rgba(59, 130, 246, 0.4);
          }
          100% {
            background-color: transparent;
            border: 1px solid transparent;
          }
        }
        
        @keyframes pulse-gentle {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-highlight {
          animation: highlight 3s ease-out forwards;
          border-radius: 8px;
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 1.5s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}); 