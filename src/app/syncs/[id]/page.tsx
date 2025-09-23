"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { ArrowLeft, AlertTriangle, Database } from "lucide-react";
import { SyncHeader } from "@/components/SyncHeader";
import { RecordsView } from "@/components/records-view";
import { useSyncData } from "@/hooks/use-sync-data";
import { SyncActivities } from "@/components/SyncActivities";
import { AppObjectKey } from "@/lib/app-objects-schemas";

export default function SyncPage() {
  const { sync, error, isLoading } = useSyncData();

  const syncRecordsProps = useMemo(() => ({
    appObjectKey: sync?.appObjectKey as AppObjectKey,
    syncId: sync?._id.toString() || "",
    syncStatus: sync?.status,
    syncError: sync?.pullError,
  }), [sync?.appObjectKey, sync?._id, sync?.status, sync?.pullError]);

  const syncActivitiesProps = useMemo(() => ({
    syncId: sync?._id || "",
  }), [sync?._id]);

  if (isLoading) return <Loader message="Loading sync details..." />;

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <span>Failed to load sync details</span>
      </div>
    );

  if (!sync)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Database className="w-8 h-8 mb-2" />
        <span>Sync not found.</span>
      </div>
    );

  return (
    <div className="w-full">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Syncs
      </Link>
      <SyncHeader sync={sync} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecordsView {...syncRecordsProps} />
        </div>
        <div className="lg:col-span-1">
          <SyncActivities {...syncActivitiesProps} />
        </div>
      </div>
    </div>
  );
}
  