"use client";

import { memo, useState, useCallback } from "react";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { IRecord, SyncStatus } from "@/models/types";
import { SyncStatusObject } from "@/models/types";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { capitalize } from "@/lib/string-utils";
import { getPluralForm } from "@/lib/pluralize-utils";
import recordTypesConfig from "@/lib/record-type-config";
import { Record } from "./Record";
import { CreateRecordModal } from "./CreateRecordModal";
import { EditRecordDialog } from "./EditRecordDialog";
import { toast } from "sonner";

interface SyncRecordsProps {
  recordType: string;
  syncId: string;
  syncStatus?: SyncStatus;
}

interface PaginationData {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startRecord: number;
  endRecord: number;
}

const PAGE_SIZE = 50;
const REFRESH_INTERVAL = 3000;

const PaginationControls = memo(function PaginationControls({
  pagination,
  isNavigating,
  onPreviousPage,
  onNextPage,
}: {
  pagination?: PaginationData;
  isNavigating: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  const formatRecordCount = () => {
    if (!pagination) return 'Loading...';
    return `${pagination.startRecord}–${pagination.endRecord} of ${pagination.totalRecords.toLocaleString()}`;
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b">
      <div className="text-sm text-gray-700">
        Showing {formatRecordCount()}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination?.hasPreviousPage || isNavigating}
          onClick={onPreviousPage}
          className="flex items-center gap-1"
        >
          {isNavigating ? (
            <Skeleton className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination?.hasNextPage || isNavigating}
          onClick={onNextPage}
          className="flex items-center gap-1"
        >
          Next
          {isNavigating ? (
            <Skeleton className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
});

const EmptyState = memo(function EmptyState({
  recordType,
  syncId,
  isSyncInProgress,
}: {
  recordType: string;
  syncId: string;
  isSyncInProgress: boolean;
}) {
  return (
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
      {!isSyncInProgress && recordTypesConfig[recordType as keyof typeof recordTypesConfig]?.allowCreate && (
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
  );
});

const LoadingSkeleton = memo(function LoadingSkeleton({ recordType }: { recordType: string }) {
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
});

export const SyncRecords = memo(function SyncRecords({ recordType, syncId, syncStatus }: SyncRecordsProps) {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    data: recordsData,
    mutate: mutateRecords,
    isLoading,
  } = useSWR(
    id ? [`/api/sync/${id}/records?page=${currentPage}&limit=${PAGE_SIZE}`, "token"] : null,
    async ([url]) => fetchWithAuth(url, getToken),
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: false,
      keepPreviousData: true,
      onSuccess: () => setIsNavigating(false),
    }
  );

  const records = recordsData?.data || [];
  const pagination: PaginationData | undefined = recordsData?.pagination;

  const handleDeleteRecord = useCallback(async (recordId: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete this ${recordType}? This action cannot be undone.`);

    if (!confirmed) return;

    try {
      const response = await fetchWithAuth(`/api/sync/${syncId}/records/${recordId}`, getToken, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to delete record');
      }

      toast.success('Record deleted successfully');
      mutateRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete record');
    }
  }, [recordType, syncId, mutateRecords]);

  const handleEditRecord = useCallback((record: IRecord) => {
    setEditingRecord(record);
    setEditDialogOpen(true);
  }, []);

  const handleRecordUpdated = useCallback(() => {
    mutateRecords();
    setEditDialogOpen(false);
    setEditingRecord(null);
  }, [mutateRecords]);

  const handlePreviousPage = useCallback(() => {
    if (pagination?.hasPreviousPage) {
      setIsNavigating(true);
      setCurrentPage(currentPage - 1);
    }
  }, [pagination?.hasPreviousPage, currentPage]);

  const handleNextPage = useCallback(() => {
    if (pagination?.hasNextPage) {
      setIsNavigating(true);
      setCurrentPage(currentPage + 1);
    }
  }, [pagination?.hasNextPage, currentPage]);

  // Show loading skeleton only on initial load (no previous data)
  if (isLoading && !recordsData) {
    return <LoadingSkeleton recordType={recordType} />;
  }

  if (records.length === 0) {
    const isSyncInProgress = syncStatus === SyncStatusObject.IN_PROGRESS;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {capitalize(getPluralForm(recordType))}
          </h2>
        </div>
        <EmptyState
          recordType={recordType}
          syncId={syncId}
          isSyncInProgress={isSyncInProgress}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {capitalize(getPluralForm(recordType))}
          </h2>
          {recordTypesConfig[recordType as keyof typeof recordTypesConfig]?.allowCreate && (
            <CreateRecordModal
              recordType={recordType}
              syncId={syncId}
            />
          )}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <PaginationControls
            pagination={pagination}
            isNavigating={isNavigating}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />
          <div>
            {records.map(
              (record: IRecord & { _id: string }, idx: number) => (
                <Record
                  key={record._id || idx}
                  record={record}
                  index={idx}
                  onRecordDeleted={handleDeleteRecord}
                  onEditRecord={handleEditRecord}
                  recordType={recordType}
                />
              )
            )}
          </div>
        </div>
      </div>

      {editingRecord && (
        <EditRecordDialog
          record={editingRecord}
          recordType={recordType}
          syncId={syncId}
          onRecordUpdated={handleRecordUpdated}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  );
}); 