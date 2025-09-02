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
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Download, Loader } from "lucide-react";
import { IntegrationSelect } from "./integration-select";
import { Skeleton } from "@/components/ui/skeleton";
import "@membranehq/react/styles.css";
import Image from "next/image";
import { FormLabel } from "@/components/ui/form-label";
import { Integration, DataSourceInstance } from "@membranehq/sdk";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { useIntegrationConnection } from "@/components/sync-config-modal/use-integration-connection";
import { CustomDataSourceConfiguration } from "./custom-data-source-configuration";
import { CustomFieldMappingConfiguration } from "./custom-field-mapping-configuration";
import { SectionWithStatus } from "./section-with-status";
import appObjects from "@/lib/app-objects";
import { AppObjectKey } from "@/lib/app-objects-schemas";
import { useDataSources } from "@membranehq/react";

function SyncConfigModal({ trigger }: { trigger: React.ReactNode }) {
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [selectedAppObjectKey, setSelectedAppObjectKey] = useState<
    string | undefined
  >();
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [dataSourceInstance, setDataSourceInstance] =
    useState<DataSourceInstance | null>(null);

  const { dataSources: dataSources = [] } =
    useDataSources();

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
      if (!selectedAppObjectKey) {
        toast.error("No Object selected");
        setSyncing(false);
        return;
      }
      await fetchWithAuth("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integrationKey: selectedIntegration?.key,
          recordType: selectedAppObjectKey,
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


  const dataSourceKeys = dataSources.map((dataSource) => dataSource.key);

  console.log("dataSourceKeys", dataSourceKeys);

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
            {/* 1: App Object Select (Always visible) */}
            <SectionWithStatus done={!!selectedAppObjectKey}>
              <div className="flex flex-col w-full max-w-xs">
                <FormLabel
                  label="Select Object"
                  tooltip="Choose which app object you want to sync."
                  size="sm"
                  className="mb-1"
                />
                <Select
                  value={selectedAppObjectKey}
                  onValueChange={(value) => {
                    if (selectedIntegration) setSelectedIntegration(null);

                    setSelectedAppObjectKey(value);
                  }}
                >
                  <SelectTrigger
                    id="app-object-select"
                    className="min-w-[200px]"
                  >
                    <SelectValue placeholder="Select an app object">
                      {selectedAppObjectKey &&
                        (() => {
                          const obj =
                            appObjects[selectedAppObjectKey as AppObjectKey];
                          if (!obj) return null;
                          const Icon = obj.icon;
                          return (
                            <span className="inline-flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {obj.label}
                            </span>
                          );
                        })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(appObjects).map(([key, obj]) => {
                      const Icon = obj.icon;
                      /**
                       * Prevent showing App Object if we wont't have a data source for it
                       */
                      if (!dataSourceKeys.includes(key)) return null;

                      return (
                        <SelectItem value={key} key={key}>
                          <span className="inline-flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {obj.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </SectionWithStatus>

            {/* 2: Integration Select (Always visible) */}
            <SectionWithStatus done={!!selectedIntegration}>
              <IntegrationSelect
                value={selectedIntegration}
                onValueChange={(integration) => {
                  setSelectedIntegration(integration);
                }}
                dataSourceKey={selectedAppObjectKey}
                label="Select Integration"
              />
            </SectionWithStatus>

            {/* 3: Connect Button (Visible if integration selected has no connection) */}
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

            {/* 4: Create data source instance and let you configure it, renders nothing if data source doesn't have any parameters */}
            {!!selectedAppObjectKey && !!connection?.id && (
              <CustomDataSourceConfiguration
                onDataSourceInstanceChange={(dataSourceInstance) =>
                  setDataSourceInstance(dataSourceInstance)
                }
                instanceKey={instanceKey.current}
                integrationKey={selectedIntegration?.key}
                dataSourceKey={selectedAppObjectKey}
                connectionId={connection.id}
              />
            )}

            {/* 5: Create field mapping instance and let you configure it */}
            {!!selectedAppObjectKey &&
              !!connection?.id &&
              !!dataSourceInstance && (
                <CustomFieldMappingConfiguration
                  instanceKey={instanceKey.current}
                  integrationKey={selectedIntegration?.key}
                  fieldMappingKey={selectedAppObjectKey}
                />
              )}
          </form>
        </div>
        {/* Modal Footer */}
        <div className="w-full border-t bg-white p-3 flex justify-end">
          <Button
            type="button"
            className="bg-primary text-white font-semibold hover:bg-primary/90 transition"
            disabled={!selectedIntegration || !selectedAppObjectKey || syncing}
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
