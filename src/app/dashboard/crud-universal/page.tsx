"use client";

import React, { useState } from "react";
import { DataSource, Integration } from "@integration-app/sdk";
import { Button } from "@/components/ui/button";
import { Records } from "../sync/[id]/components/Records/Records";
import type { RecordType } from "@/models/types";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, Database, Zap } from "lucide-react";
import { PaginationControls } from "@/app/dashboard/sync/[id]/components/Records/pagination-controls";
import { useDataSources, useDataSource } from "@integration-app/react";
import recordTypesConfig from "@/lib/record-type-config";
import { getSingularForm } from "../../../lib/pluralize-utils";
import { useIntegrationConnection } from "@/app/dashboard/components/sync-config-modal/use-integration-connection";
import { SelectionGroup } from "./components";
import { useMembraneRecords } from "./hooks/use-membrane-records";

export default function CrudUniversalPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [selectedDataSourceKey, setSelectedDataSourceKey] = useState<
    string | null
  >(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Fetch all data sources without integration ID
  const { items: dataSources, loading: dataSourcesLoading } = useDataSources();

  // fetch a single data source by key since it has more info
  const {
    dataSource: { appliedToIntegrations } = { appliedToIntegrations: [] },
    loading: appliedIntegrationsIsLoading,
  } = useDataSource({ key: selectedDataSourceKey || undefined });

  // Check if user has connection to the selected integration
  const {
    data: connection,
    isLoading: connectionLoading,
    isConnecting,
    connect,
  } = useIntegrationConnection({
    integrationKey: selectedIntegration?.key ?? null,
  });

  const {
    records,
    recordsData,
    recordsError,
    recordsLoading,
    handleDeleteRecord,
    handleCreateRecord,
    handleUpdateRecord,
    mutateRecords,
  } = useMembraneRecords({
    integrationKey: selectedIntegration?.key ?? null,
    dataSourceKey: selectedDataSourceKey,
    cursor,
  });

  const hasNextPage = !!recordsData?.output?.cursor;
  const hasPreviousPage = cursorHistory.length > 0;

  const pagination = {
    hasNextPage,
    hasPreviousPage,
  };

  const handlePreviousPage = () => {
    if (!hasPreviousPage) return;

    const previousCursor = cursorHistory[cursorHistory.length - 1];
    setCursorHistory((prev) => prev.slice(0, -1));
    setCursor(previousCursor || null);
  };

  const handleNextPage = () => {
    if (!hasNextPage) return;

    const nextCursor = recordsData?.output?.cursor;
    if (cursor) {
      setCursorHistory((prev) => [...prev, cursor]);
    }
    setCursor(nextCursor || null);
  };

  // Reset pagination when selection changes
  React.useEffect(() => {
    setCursor(null);
    setCursorHistory([]);
  }, [selectedIntegration?.key, selectedDataSourceKey]);

  const dataSourceItems = dataSources.map((dataSource: DataSource) => ({
    id: dataSource.id,
    key: dataSource.key,
    name: dataSource.name,
    icon: recordTypesConfig[
      getSingularForm(dataSource.key) as keyof typeof recordTypesConfig
    ]?.icon,
  }));

  const integrationItems = (appliedToIntegrations || []).map(
    ({ integration }) => ({
      id: integration.id,
      key: integration.key,
      name: integration.name,
      logoUri: integration.logoUri,
    })
  );

  const cleanedRecords = records.map((record) => ({
    id: record.id,
    data: record.data,
  }));

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-white border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Step 1: Data Source Selection*/}
          <SelectionGroup
            title="Object"
            items={dataSourceItems}
            selectedKey={selectedDataSourceKey}
            onSelect={setSelectedDataSourceKey}
            loading={dataSourcesLoading}
            visibleCount={2}
            titleIcon={Database}
          // titleIconColor="text-blue-600"
          />

          {/* Step 2: Applied Integrations*/}
          <SelectionGroup
            title="Integration"
            items={integrationItems}
            selectedKey={selectedIntegration?.key ?? null}
            onSelect={(key) => {
              const integration = integrationItems.find(item => item.key === key);
              setSelectedIntegration(integration as Integration ?? null);
            }}
            loading={appliedIntegrationsIsLoading}
            visibleCount={2}
            titleIcon={Zap}
          // titleIconColor="text-blue-600"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {selectedDataSourceKey && selectedIntegration ? (
          <div>
            {/* Connection Status */}
            {connectionLoading ? (
              <div className="bg-gray-50 rounded-lg">
                <div className="p-8">
                  <div className="text-center">
                    <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-48 mx-auto mb-2" />
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-10 w-40 mx-auto rounded-md" />
                  </div>
                </div>
              </div>
            ) : !connection ? (
              <div className="bg-gray-50 rounded-lg">
                <div className="p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Connect to {selectedIntegration?.name || selectedIntegration?.key}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You need to connect to{" "}
                      {selectedIntegration?.name || selectedIntegration?.key}{" "}
                      to view records.
                    </p>
                    <Button
                      onClick={connect}
                      disabled={isConnecting}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      {isConnecting ? (
                        "Connecting..."
                      ) : (
                        <>
                          {selectedIntegration?.logoUri && (
                            <Image
                              src={selectedIntegration.logoUri}
                              alt=""
                              width={16}
                              height={16}
                              className="mr-2"
                            />
                          )}
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : recordsError ? (
              <div className="bg-gray-50 rounded-lg">
                <div className="p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FolderOpen className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Error Loading Records
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {recordsError.message ||
                        "Failed to load records from the integration."}
                    </p>
                    <Button onClick={() => mutateRecords()} variant="outline">
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Records
                records={cleanedRecords}
                recordType={
                  getSingularForm(selectedDataSourceKey) as RecordType
                }
                isLoading={recordsLoading}
                onDeleteRecord={handleDeleteRecord}
                onCreateRecord={handleCreateRecord}
                onUpdateRecord={handleUpdateRecord}
                renderHeader={() => (
                  <div className="flex justify-between items-center">
                    {!recordsLoading ? (
                      cursor ? (
                        <div>
                          Showing {records.length} records, click{" "}
                          <kbd className="font-bold">Next</kbd> to load more
                        </div>
                      ) : (
                        <div>Showing {records.length} records</div>
                      )
                    ) : (
                      <div></div>
                    )}
                    <PaginationControls
                      pagination={pagination}
                      isNavigating={recordsLoading}
                      onPreviousPage={handlePreviousPage}
                      onNextPage={handleNextPage}
                    />
                  </div>
                )}
              />
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg">
            <div className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Records to Display
                </h3>
                <p className="text-gray-600 mb-4">
                  {!selectedDataSourceKey
                    ? "Please select a data source to get started."
                    : !selectedIntegration
                      ? "Please select an integration to view records."
                      : "Loading records..."}
                </p>
                {!selectedDataSourceKey && (
                  <p className="text-sm text-gray-500">
                    Choose a data source from the options above to begin.
                  </p>
                )}
                {selectedDataSourceKey && !selectedIntegration && (
                  <p className="text-sm text-gray-500">
                    Select an integration to connect and view your records.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
