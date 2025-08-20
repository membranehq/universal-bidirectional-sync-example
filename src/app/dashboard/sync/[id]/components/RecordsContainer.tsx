"use client";

import { memo, useState, useCallback } from "react";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Database, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import type { IRecord, RecordType, SyncStatus } from "@/models/types";
import { SyncStatusObject } from "@/models/types";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { capitalize } from "@/lib/string-utils";
import { getPluralForm } from "@/lib/pluralize-utils";
import { Records } from "./Records/Records";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PaginationControls } from "@/app/dashboard/sync/[id]/components/Records/pagination-controls";
import { TableRecord } from "./Records/types";


interface RecordContainerProps {
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

const getSyncStatusIcon = (status: string) => {
  switch (status) {
    case SyncStatusObject.COMPLETED:
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case SyncStatusObject.FAILED:
      return <XCircle className="w-4 h-4 text-red-500" />;
    case SyncStatusObject.IN_PROGRESS:
      return <Clock className="w-4 h-4 text-blue-500" />;
    case SyncStatusObject.PENDING:
      return <Clock className="w-4 h-4 text-gray-500" />;
    default:
      return null;
  }
};

const createStatusElement = (record: IRecord) => {
  if (record.syncError) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <p className="font-semibold">Sync Error:</p>
              <p className="text-xs">{record.syncError}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return getSyncStatusIcon(record.syncStatus);
};

const EmptyState = memo(function EmptyState({
  recordType,
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
          : `This sync hasn't pulled any ${recordType} records yet.`}
      </p>
    </div>
  );
});

export const RecordContainer = memo(function RecordContainer({
  recordType,
  syncId,
  syncStatus,
}: RecordContainerProps) {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    data: recordsData,
    mutate: mutateRecords,
    isLoading,
  } = useSWR<{
    data: IRecord[];
    pagination: PaginationData;
  }>(
    id
      ? [
        `/api/sync/${id}/records?page=${currentPage}&limit=${PAGE_SIZE}`,
        "token",
      ]
      : null,
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

  const handleDeleteRecord = useCallback(
    async (recordId: string) => {

      try {
        const response = await fetchWithAuth(
          `/api/sync/${syncId}/records/${recordId}`,
          getToken,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || errorData.error || "Failed to delete record"
          );
        }

        toast.success("Record deleted successfully");
        mutateRecords();
      } catch (error) {
        console.error("Failed to delete record:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to delete record"
        );
      }
    },
    [syncId, mutateRecords, getToken]
  );

  const handleCreateRecord = useCallback(
    async (recordData: Record<string, unknown>) => {
      try {
        const response = await fetchWithAuth(
          `/api/sync/${syncId}/records`,
          getToken,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: recordData }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || errorData.error || "Failed to create record"
          );
        }

        toast.success("Record created successfully");
        mutateRecords();
      } catch (error) {
        console.error("Failed to create record:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create record"
        );
      }
    },
    [syncId, getToken, mutateRecords]
  );

  const handleUpdateRecord = useCallback(
    async (recordId: string, recordData: Record<string, unknown>) => {
      try {
        const response = await fetchWithAuth(
          `/api/sync/${syncId}/records/${recordId}`,
          getToken,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(recordData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || errorData.error || "Failed to update record"
          );
        }

        toast.success("Record updated successfully");
        mutateRecords();
      } catch (error) {
        console.error("Failed to update record:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update record"
        );
      }
    },
    [syncId, getToken, mutateRecords]
  );

  if (records.length === 0 && !isLoading) {
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

  const cleanedRecords = records.map((record) => ({
    id: record._id,
    data: record.data,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }));

  // Create a map of record IDs to their status elements
  const statusElementsMap = new Map(
    records.map((record) => [record._id, createStatusElement(record)])
  );

  // Create pagination component
  const PaginationControlsWrapper = () => {
    const formatRecordCount = () => {
      return `${pagination?.startRecord || 0}–${pagination?.endRecord || 0} of ${(pagination?.totalRecords || 0).toLocaleString()}`;
    };

    return (
      <div className="flex items-center justify-between">
          {isLoading ? null : `Showing ${formatRecordCount()}`}
        <PaginationControls
          pagination={pagination}
          isNavigating={isNavigating}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      </div>
    );
  };

  return (
    <Records
      records={cleanedRecords}
      recordType={recordType as RecordType}
      isLoading={isLoading}
      onDeleteRecord={handleDeleteRecord}
      onCreateRecord={handleCreateRecord}
      onUpdateRecord={handleUpdateRecord}
      renderHeader={PaginationControlsWrapper}
      renderRight={(record: TableRecord) => {
        const statusElement = statusElementsMap.get(record.id);
        return statusElement;
      }}
    />
  );
});
