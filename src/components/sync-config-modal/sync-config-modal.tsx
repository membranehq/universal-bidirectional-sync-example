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
import { SelectionGroup } from "./selection-group";
import { useDataSourceAppliedIntegrations } from "@/hooks/use-applied-integrations";

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

  const { dataSources: dataSources = [] } = useDataSources();

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

  const appObjectsItems = Object.keys(appObjects)
    // .filter((key) => dataSourceKeys.includes(key))
    .map((key) => ({
      id: key,
      key: key,
      name: appObjects[key as keyof typeof appObjects].label,
      icon: appObjects[key as keyof typeof appObjects].icon,
      category: appObjects[key as keyof typeof appObjects].category,
    }));

  const { integrations, loading: integrationsLoading, error: integrationsError } =
    useDataSourceAppliedIntegrations(selectedAppObjectKey ?? null);

  // filter out integrations that are not ready (credentials not set)
  const integrationItems = integrations
    .filter((integration) => integration.state === "READY")
    .map((integration) => ({
      id: integration.id,
      key: integration.key!,
      name: integration.name,
      logoUri: integration.logoUri,
    }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="h-[600px] flex flex-col pb-0 max-w-4xl">
        <DialogTitle className="flex items-center gap-2">
          Configure Sync
        </DialogTitle>
        <div className="p-3 flex-1 overflow-y-auto">
          <form
            className="flex flex-col gap-4 w-full mt-4 overflow-y-auto"
            onSubmit={(e) => {
              e.preventDefault();
              startSync();
            }}
          >
            {/* 1: App Object Select (Always visible) */}
            <SectionWithStatus done={!!selectedAppObjectKey}>
              <FormLabel
                label="Select Object"
                tooltip="Choose which app object you want to sync."
                size="sm"
                className="mb-1"
              />

              <SelectionGroup
                items={appObjectsItems}
                selectedKey={selectedAppObjectKey ?? null}
                onSelect={(key) => {
                  if (selectedIntegration) setSelectedIntegration(null);
                  setSelectedAppObjectKey(key);
                }}
                visibleCount={5}
                viewMode={"all"}
              />
            </SectionWithStatus>

            {/* 2: Integration Select (Always visible) */}
            <SectionWithStatus done={!!selectedIntegration}>
              <FormLabel
                label="Select Integration"
                tooltip="Choose which app object you want to sync."
                size="sm"
                className="mb-1"
              />
              {!selectedAppObjectKey ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center text-gray-500 text-sm">
                  <p>Integration list will appear when you select object</p>
                </div>
              ) : integrationsError ? (
                <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center text-red-600 text-sm">
                  <p className="font-medium">Failed to load integrations</p>
                  <p className="text-xs mt-1 text-red-500">{integrationsError.message}</p>
                </div>
              ) : (
                <SelectionGroup
                  items={integrationItems}
                  selectedKey={selectedIntegration?.key ?? null}
                  onSelect={(key) => {
                    const integration = integrations.find((i) => i.key === key);
                    if (integration) setSelectedIntegration(integration);
                  }}
                  visibleCount={3}
                  loading={integrationsLoading}
                  viewMode={"all"}
                />
              )}
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
