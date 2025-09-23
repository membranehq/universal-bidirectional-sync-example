"use client";

import { memo, useState, useCallback } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import {
  Database,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus,
} from "lucide-react";
import type { IRecord, SyncStatus } from "@/models/types";
import { SyncStatusObject } from "@/models/types";
import axios from "axios";
import { getPluralForm } from "@/lib/pluralize-utils";
import { Records } from "./Records/Records";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PaginationControls } from "./Records/pagination-controls";
import { CreateRecordModal } from "./CreateRecordModal";
import appObjects from "@/lib/app-objects";
import { Button } from "./ui/button";
import { AppObjectKey } from "@/lib/app-objects-schemas";
import { useResync } from "@/hooks/use-resync";

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
  isSyncInProgress,
  onResync,
  isResyncing,
}: {
  isSyncInProgress: boolean;
  onResync: () => void | Promise<void>;
  isResyncing: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mb-6">
        <Database className="w-12 h-12 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No records</h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {isSyncInProgress
          ? `Records will appear here once this sync pull records.`
          : `The are no records for this sync.`}
      </p>
      <Button
        size="sm"
        variant="secondary"
        onClick={onResync}
        disabled={isResyncing}
        className="inline-flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isResyncing ? "animate-spin" : ""}`} />
        {isResyncing ? "Resyncing..." : "Resync"}
      </Button>
    </div>
  );
});

const ErrorState = memo(function ErrorState({
  syncError,
  onResync,
  isResyncing,
}: {
  syncError?: string;
  onResync: () => void | Promise<void>;
  isResyncing: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-rose-100 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Sync failed</h3>
      {syncError ? (
        <p className="text-gray-600 mb-6 max-w-xl break-words">{syncError}</p>
      ) : (
        <p className="text-gray-600 mb-6 max-w-md">
          Something went wrong during the last sync.
        </p>
      )}
      <Button
        size="sm"
        variant="secondary"
        onClick={onResync}
        disabled={isResyncing}
        className="inline-flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isResyncing ? "animate-spin" : ""}`} />
        {isResyncing ? "Resyncing..." : "Resync"}
      </Button>
    </div>
  );
});

interface RecordContainerProps {
  appObjectKey: AppObjectKey;
  syncId: string;
  syncStatus?: SyncStatus;
  syncError?: string;
}

export const RecordsView = memo(function RecordContainer({
  appObjectKey,
  syncId,
  syncStatus,
  syncError,
}: RecordContainerProps) {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCreateRecordModalOpen, setIsCreateRecordModalOpen] = useState(false);
  const { resync, isResyncing } = useResync(syncId);

  const {
    data: recordsData,
    mutate: mutateRecords,
    isLoading,
    isValidating,
  } = useSWR<{
    data: IRecord[];
    pagination: PaginationData;
  }>(
    id
      ? [`/api/syncs/${id}/records?page=${currentPage}&limit=${PAGE_SIZE}`]
      : null,
    async ([url]) => {
      const response = await axios.get(url);
      return response.data;
    },
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: false,
      keepPreviousData: true,
      onSuccess: () => setIsNavigating(false),
    }
  );

  const records = recordsData?.data || [];
  const pagination: PaginationData | undefined = recordsData?.pagination;

  const config = appObjects[appObjectKey];
  const IconComponent = config?.icon;

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
        await axios.delete(`/api/syncs/${syncId}/records/${recordId}`);

        toast.success("Record deleted successfully");
        mutateRecords();
      } catch (error) {
        console.error("Failed to delete record:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to delete record"
        );
      }
    },
    [syncId, mutateRecords]
  );

  const handleCreateRecord = useCallback(
    async (recordData: Record<string, unknown>) => {
      try {
        await axios.post(
          `/api/syncs/${syncId}/records`,
          { data: recordData },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        toast.success("Record created successfully");
        mutateRecords();
      } catch (error) {
        console.error("Failed to create record:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create record"
        );
      }
    },
    [syncId, mutateRecords]
  );

  const handleUpdateRecord = useCallback(
    async (recordId: string, recordData: Record<string, unknown>) => {
      try {
        await axios.put(
          `/api/syncs/${syncId}/records/${recordId}`,
          recordData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        toast.success("Record updated successfully");
        mutateRecords();
      } catch (error) {
        console.error("Failed to update record:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update record"
        );
      }
    },
    [syncId, mutateRecords]
  );

  const handleRefetch = useCallback(() => {
    mutateRecords();
  }, [mutateRecords]);

  const handleResync = useCallback(async () => {
    const ok = await resync();
    if (ok) mutateRecords();
  }, [resync, mutateRecords]);

  if (records.length === 0 && !isLoading) {
    const isSyncInProgress = syncStatus === SyncStatusObject.IN_PROGRESS;

    return (
      <div className="space-y-4">
        {syncStatus === SyncStatusObject.FAILED ? (
          <ErrorState
            syncError={syncError}
            onResync={handleResync}
            isResyncing={isResyncing}
          />
        ) : (
          <EmptyState
            isSyncInProgress={isSyncInProgress}
            onResync={handleResync}
            isResyncing={isResyncing}
          />
        )}
      </div>
    );
  }

  // Create a map of record IDs to their status elements
  const statusElementsMap = new Map(
    records.map((record) => [record._id, createStatusElement(record)])
  );

  const PaginationControlsWrapper = () => {
    const formatRecordCount = () => {
      return `${pagination?.startRecord || 0}–${pagination?.endRecord || 0
        } of ${(pagination?.totalRecords || 0).toLocaleString()}`;
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <h2 className="text-xl font-semibold text-gray-700 tracking-tight flex items-center gap-2">
          <IconComponent className="w-5 h-5 text-gray-500" />
          {getPluralForm(config.label)}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefetch}
            disabled={isLoading}
            className="ml-2 p-1 h-6 w-6"
          >
            <RefreshCw
              className={`w-4 h-4 ${isValidating ? "animate-spin" : ""}`}
            />
          </Button>
        </h2>
        {appObjects[appObjectKey as keyof typeof appObjects]?.allowCreate && (
          <Button
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsCreateRecordModalOpen(true)}
          >
            Create {config.label}
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>
      {syncStatus === SyncStatusObject.FAILED && !isLoading && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold">Sync failed</div>
            {syncError ? (
              <div className="mt-0.5 break-words">{syncError}</div>
            ) : null}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResync}
            disabled={isResyncing}
            className="inline-flex items-center gap-2 ml-2 shrink-0 bg-white border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className={`w-4 h-4 ${isResyncing ? "animate-spin" : ""}`} />
            {isResyncing ? "Resyncing..." : "Resync"}
          </Button>
        </div>
      )}
      <Records
        records={records}
        appObjectKey={appObjectKey}
        isLoading={isLoading}
        onDeleteRecord={handleDeleteRecord}
        onUpdateRecord={handleUpdateRecord}
        renderHeader={PaginationControlsWrapper}
        renderRight={(record: IRecord) => {
          const statusElement = statusElementsMap.get(record._id);
          return statusElement;
        }}
      />
      {isCreateRecordModalOpen && (
        <CreateRecordModal
          appObjectKey={appObjectKey}
          onCreatedRecord={handleCreateRecord}
          onOpenChange={setIsCreateRecordModalOpen}
          open={isCreateRecordModalOpen}
        />
      )}
    </div>
  );
});
