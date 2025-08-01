"use client";

import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { IRecord, ISync } from "@/models/types";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  AlertTriangle,
  Database,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SyncActivities } from "./components/SyncActivities";
import { Record } from "./components/Record";
import { SyncDetails } from "./components/SyncDetails";
import { ExternalEventSubscription } from "@integration-app/sdk";
import { capitalize } from "@/lib/string-utils";

export default function SyncDetailsPage() {
  const { id } = useParams();
  const { getToken } = useAuth();

  const { data, error, isLoading } = useSWR<{
    data: {
      sync: ISync; subscriptions: {
        "data-record-created": ExternalEventSubscription | null;
        "data-record-updated": ExternalEventSubscription | null;
        "data-record-deleted": ExternalEventSubscription | null;
      }
    };
  }>(
    id ? [`/api/sync/${id}`, "token"] : null,
    async ([url]) => fetchWithAuth(url, getToken),
    {
      refreshInterval: 3000,
    }
  );

  const {
    data: recordsData,
    mutate: mutateRecords,
    isLoading: recordsLoading,
  } = useSWR(
    id ? [`/api/sync/${id}/records`, "token"] : null,
    async ([url]) => fetchWithAuth(url, getToken),
    {
      refreshInterval: 3000,
    }
  );


  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
  const records = recordsData?.data || [];

  return (
    <div className="w-full">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Syncs
      </Link>

      <SyncDetails syncId={id as string} />

      {/* Records and Events Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Records Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {capitalize(sync.recordType)}
            </h2>
            {records.length > 0 && (
              <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    Create {sync.recordType} <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create {sync.recordType}</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      Create form will be implemented here.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {recordsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-16 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <Database className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No records yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                This sync hasn&apos;t pulled any {sync.recordType} records
                yet. Records will appear here once the sync completes
                successfully.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create {sync.recordType}
                </Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right sticky right-0 bg-background"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record: IRecord & { _id: string }, idx: number) => (
                    <Record
                      key={record._id || idx}
                      record={record}
                      index={idx}
                      syncId={id as string}
                      onRecordDeleted={() => mutateRecords()}
                      recordType={sync.recordType}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <SyncActivities sync={sync} />
        </div>
      </div>
    </div>
  );
}
