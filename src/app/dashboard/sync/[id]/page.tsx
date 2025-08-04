"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { ISync, Subscriptions } from "@/models/types";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { Loader } from "@/components/ui/loader";
import { ArrowLeft, AlertTriangle, Database } from "lucide-react";
import { SyncActivities } from "./components/SyncActivities";
import { SyncHeader } from "./components/SyncHeader";
import { SyncRecords } from "./components/SyncRecords";

export default function SyncPage() {
  const { id } = useParams();
  const { getToken } = useAuth();

  const { data, error, isLoading } = useSWR<{
    data: {
      sync: ISync;
      subscriptions: Subscriptions;
    };
  }>(
    id ? [`/api/sync/${id}`, "token"] : null,
    async ([url]) => fetchWithAuth(url, getToken),
    {
      refreshInterval: 3000,
      revalidateOnFocus: false,
    }
  );

  const syncRecordsProps = useMemo(() => ({
    recordType: data?.data?.sync?.recordType || "",
    syncId: data?.data?.sync?._id || "",
    syncStatus: data?.data?.sync?.status,
  }), [data?.data?.sync?.recordType, data?.data?.sync?._id, data?.data?.sync?.status]);

  const syncActivitiesProps = useMemo(() => ({
    syncId: data?.data?.sync?._id || "",
  }), [data?.data?.sync?._id]);

  if (isLoading) return <Loader message="Loading sync details..." />;

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <span>Failed to load sync details</span>
      </div>
    );

  if (!data?.data?.sync)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Database className="w-8 h-8 mb-2" />
        <span>Sync not found.</span>
      </div>
    );

  const { sync } = data.data;

  return (
    <div className="w-full">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Syncs
      </Link>
      <SyncHeader sync={sync} subscriptions={data.data.subscriptions} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SyncRecords {...syncRecordsProps} />
        </div>
        <div className="lg:col-span-1">
          <SyncActivities {...syncActivitiesProps} />
        </div>
      </div>
    </div>
  );
}
