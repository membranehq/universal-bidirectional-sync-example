"use client";

import { memo } from "react";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Plus } from "lucide-react";
import type { IRecord, SyncStatus } from "@/models/types";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { capitalize } from "@/lib/string-utils";
import { getPluralForm } from "@/lib/pluralize-utils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Record } from "./Record";
import { CreateRecordModal } from "./CreateRecordModal";

interface SyncRecordsProps {
  recordType: string;
  syncId: string;
  syncStatus?: SyncStatus;
}

export const SyncRecords = memo(function SyncRecords({ recordType, syncId, syncStatus }: SyncRecordsProps) {
  const { id } = useParams();
  const { getToken } = useAuth();

  const {
    data: recordsData,
    mutate: mutateRecords,
    isLoading,
  } = useSWR(
    id ? [`/api/sync/${id}/records`, "token"] : null,
    async ([url]) => fetchWithAuth(url, getToken),
    {
      refreshInterval: 3000,
      revalidateOnFocus: false,
    }
  );

  const records = recordsData?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {capitalize(getPluralForm(recordType))}
          </h2>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    const isSyncInProgress = syncStatus === "in_progress";

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {capitalize(getPluralForm(recordType))}
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mb-6">
            <Database className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No records yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            {isSyncInProgress
              ? `This sync hasn't pulled any ${recordType} records yet. Records will appear here once the sync completes successfully.`
              : `This sync hasn't pulled any ${recordType} records yet.`
            }
          </p>
          {!isSyncInProgress && (
            <div className="flex flex-col sm:flex-row gap-3">
              <CreateRecordModal
                recordType={recordType}
                syncId={syncId}
                trigger={
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create {recordType}
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {capitalize(getPluralForm(recordType))}
          <span className="text-sm text-gray-500">({records.length})</span>
        </h2>
        <CreateRecordModal
          recordType={recordType}
          syncId={syncId}
        />
      </div>

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
            {records.map(
              (record: IRecord & { _id: string }, idx: number) => (
                <Record
                  key={record._id || idx}
                  record={record}
                  index={idx}
                  syncId={id as string}
                  onRecordDeleted={() => mutateRecords()}
                  onRecordUpdated={() => mutateRecords()}
                  recordType={recordType}
                />
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}); 