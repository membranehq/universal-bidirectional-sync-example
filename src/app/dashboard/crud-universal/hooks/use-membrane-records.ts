import { useCallback } from "react";
import { useIntegrationApp } from "@integration-app/react";
import useSWR from "swr";
import { getSingularForm } from "../../../../lib/pluralize-utils";
import { getElementKey } from "@/lib/element-key";
import { TableRecord } from "../../sync/[id]/components/Records/types";

interface UseMembraneRecordsParams {
  integrationKey: string | null;
  dataSourceKey: string | null;
  cursor?: string | null;
}

export function useMembraneRecords({
  integrationKey,
  dataSourceKey,
  cursor,
}: UseMembraneRecordsParams) {
  const membraneClient = useIntegrationApp();

  // SWR key for caching
  const swrKey =
    integrationKey && dataSourceKey
      ? `records-${integrationKey}-${dataSourceKey}-${
          cursor || "initial"
        }`
      : null;

  // Fetcher function for SWR
  const fetcher = useCallback(async () => {
    if (!integrationKey || !dataSourceKey) {
      throw new Error("Missing required parameters");
    }

    const actionKey = getElementKey(
      getSingularForm(dataSourceKey),
      "list-action"
    );

    const result = await membraneClient
      .connection(integrationKey)
      .action(actionKey)
      .run({ cursor });

    return result;
  }, [membraneClient, integrationKey, dataSourceKey, cursor]);

  // Fetch records using SWR
  const {
    data: recordsData,
    error: recordsError,
    isLoading: recordsLoading,
    mutate: mutateRecords,
  } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const records: TableRecord[] =
    recordsData?.output?.records.map((record: Record<string, unknown>) => ({
      ...record,
      data: record.fields,
    })) || [];

  const handleDeleteRecord = useCallback(
    async (recordId: string) => {
      if (!integrationKey || !dataSourceKey) return;

      const actionKey = getElementKey(
        getSingularForm(dataSourceKey),
        "delete-action"
      );

      await membraneClient
        .connection(integrationKey)
        .action(actionKey)
        .run({ id: recordId });

      // Update local state after successful action
      const updatedData = {
        ...recordsData,
        output: {
          ...recordsData?.output,
          records:
            recordsData?.output?.records.filter(
              (record: Record<string, unknown>) => record.id !== recordId
            ) || [],
        },
      };
      mutateRecords(updatedData, false);
    },
    [
      membraneClient,
      integrationKey,
      dataSourceKey,
      mutateRecords,
      recordsData,
    ]
  );

  const handleCreateRecord = useCallback(
    async (recordData: Record<string, unknown>) => {
      if (!integrationKey || !dataSourceKey) return;

      const actionKey = getElementKey(
        getSingularForm(dataSourceKey),
        "create-action"
      );

      const result = await membraneClient
        .connection(integrationKey)
        .action(actionKey)
        .run(recordData);

      // Update local state after successful action
      const newRecord = {
        id: result.output?.id || `new-${Date.now()}`,
        fields: recordData,
        ...recordData,
      };

      const updatedData = {
        ...recordsData,
        output: {
          ...recordsData?.output,
          records: [newRecord, ...(recordsData?.output?.records || [])],
        },
      };
      mutateRecords(updatedData, false);
    },
    [
      membraneClient,
      integrationKey,
      dataSourceKey,
      mutateRecords,
      recordsData,
    ]
  );

  const handleUpdateRecord = useCallback(
    async (recordId: string, recordData: Record<string, unknown>) => {
      if (!integrationKey || !dataSourceKey) return;

      const actionKey = getElementKey(
        getSingularForm(dataSourceKey),
        "update-action"
      );

      await membraneClient
        .connection(integrationKey)
        .action(actionKey)
        .run({ id: recordId, ...recordData });

      // Update local state after successful action
      const updatedData = {
        ...recordsData,
        output: {
          ...recordsData?.output,
          records:
            recordsData?.output?.records.map(
              (record: Record<string, unknown>) =>
                record.id === recordId
                  ? {
                      ...record,
                      fields: {
                        ...(record.fields as Record<string, unknown>),
                        ...recordData,
                      },
                      ...recordData,
                    }
                  : record
            ) || [],
        },
      };
      mutateRecords(updatedData, false);
    },
    [
      membraneClient,
      integrationKey,
      dataSourceKey,
      mutateRecords,
      recordsData,
    ]
  );

  return {
    records,
    recordsData,
    recordsError,
    recordsLoading,
    handleDeleteRecord,
    handleCreateRecord,
    handleUpdateRecord,
    mutateRecords,
  };
}
