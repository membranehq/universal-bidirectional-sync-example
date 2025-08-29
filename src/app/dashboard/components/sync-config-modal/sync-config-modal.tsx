"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useRef } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Download, Loader } from "lucide-react";
import { IntegrationSelect } from "./integration-select";
import { Skeleton } from "@/components/ui/skeleton";
import "@membranehq/react/styles.css";
import Image from "next/image";
import { FormLabel } from "@/components/ui/form-label";
import { Integration, DataSourceInstance } from "@membranehq/sdk";
import { getSingularForm } from "@/lib/pluralize-utils";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { useDataSources } from "@/app/dashboard/components/sync-config-modal/use-data-sources";
import { useIntegrationConnection } from "@/app/dashboard/components/sync-config-modal/use-integration-connection";
import { CustomDataSourceConfiguration } from "./custom-data-source-configuration";
import { CustomFieldMappingConfiguration } from "./custom-field-mapping-configuration";
import { SectionWithStatus } from "./section-with-status";

function SyncConfigModal({ trigger }: { trigger: React.ReactNode }) {
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [selectedDataSourceKey, setSelectedDataSourceKey] =
    useState<string>("");
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [dataSourceInstance, setDataSourceInstance] =
    useState<DataSourceInstance | null>(null);

  const { data: dataSources, isLoading: dataSourcesLoading } = useDataSources({
    integrationId: selectedIntegration?.id,
  });

  const {
    data: connection,
    isConnecting,
    connect,
  } = useIntegrationConnection({
    integrationKey: selectedIntegration?.key,
  });

  const instanceKey = useRef(uuidv4());

  const startSync = async () => {
    setSyncing(true);
    try {
      if (!selectedDataSourceKey) {
        toast.error("No Object selected");
        setSyncing(false);
        return;
      }
      await fetchWithAuth("/api/sync", getToken, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integrationKey: selectedIntegration?.key,
          recordType: getSingularForm(selectedDataSourceKey),
          instanceKey: instanceKey.current,
        }),
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to start sync:", error);
      toast.error("Failed to start sync");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="h-[600px] flex flex-col pb-0 max-w-3xl">
        <DialogTitle className="flex items-center gap-2">
          Configure Sync
        </DialogTitle>
        <div className="p-3 flex-1 overflow-y-auto">
          <form
            className="flex flex-col gap-4 w-full max-w-xl mt-4 overflow-y-auto"
            onSubmit={(e) => {
              e.preventDefault();
              startSync();
            }}
          >
            {/* 1: Integration Select (Always visible) */}
            <SectionWithStatus done={!!selectedIntegration}>
              <IntegrationSelect
                value={selectedIntegration}
                onValueChange={setSelectedIntegration}
                label="Select Integration"
              />
            </SectionWithStatus>

            {/* 2: Connect Button (Visible if integration selected has no connection) */}
            {!!selectedIntegration && !connection && (
              <SectionWithStatus done={false}>
                <div className="flex flex-col gap-1 w-full">
                  <FormLabel
                    label="Connect Integration"
                    tooltip="Connect your account to the selected integration to enable data syncing."
                    size="sm"
                    className="mb-1"
                  />
                  <Button
                    type="button"
                    className="mt-2 self-start"
                    disabled={isConnecting}
                    onClick={async () => {
                      try {
                        await connect();
                      } catch (err) {
                        console.error("Failed to connect:", err);
                        toast.error("Failed to connect integration");
                      }
                    }}
                  >
                    Connect {selectedIntegration.name}{" "}
                    <Image
                      className="r"
                      width={16}
                      height={16}
                      src={selectedIntegration.logoUri}
                      alt={selectedIntegration.name}
                    />
                  </Button>
                </div>
              </SectionWithStatus>
            )}

            {/* 3: List all data sources for the selected integration after connecting*/}
            {!!connection && (
              <SectionWithStatus done={!!selectedDataSourceKey}>
                <div className="flex flex-col w-full max-w-xs">
                  <FormLabel
                    label="Select Object"
                    tooltip="Choose which object to sync from the selected integration."
                    size="sm"
                    className="mb-1"
                  />
                  <div className="flex flex-col gap-1 w-full">
                    {!dataSourcesLoading ? (
                      <Select
                        value={selectedDataSourceKey}
                        onValueChange={setSelectedDataSourceKey}
                      >
                        <SelectTrigger
                          id="data-source-select"
                          className="min-w-[200px]"
                        >
                          <SelectValue placeholder="Select an object">
                            {selectedDataSourceKey &&
                              (() => {
                                const ds = dataSources.find(
                                  (d) => d.key === selectedDataSourceKey
                                );
                                if (!ds) return null;
                                return <span>{ds.name}</span>;
                              })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {dataSources.map((ds) => (
                            <SelectItem value={ds.key} key={ds.key}>
                              {ds.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Skeleton className="h-10 w-2/3" />
                    )}
                  </div>
                </div>
              </SectionWithStatus>
            )}

            {/* 4: Create data source instance and let you configure it, renders nothing if data source doesn't have any parameters */}
            {!!selectedDataSourceKey && !!connection?.id && (
              <CustomDataSourceConfiguration
                onDataSourceInstanceChange={(dataSourceInstance) =>
                  setDataSourceInstance(dataSourceInstance)
                }
                instanceKey={instanceKey.current}
                integrationKey={selectedIntegration?.key}
                dataSourceKey={selectedDataSourceKey}
                connectionId={connection.id}
              />
            )}

            {/* 5: Create field mapping instance and let you configure it */}
            {!!selectedDataSourceKey &&
              !!connection?.id &&
              !!dataSourceInstance && (
                <CustomFieldMappingConfiguration
                  instanceKey={instanceKey.current}
                  integrationKey={selectedIntegration?.key}
                  fieldMappingKey={selectedDataSourceKey}
                />
              )}
          </form>
        </div>
        {/* Modal Footer */}
        <div className="w-full border-t bg-white p-3 flex justify-end">
          <Button
            type="button"
            className="bg-primary text-white font-semibold hover:bg-primary/90 transition"
            disabled={!selectedIntegration || !selectedDataSourceKey || syncing}
            onClick={startSync}
          >
            {syncing && <Loader className="w-4 h-4 animate-spin mr-2" />}
            Sync <Download className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { SyncConfigModal };
