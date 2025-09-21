"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Database, Download, Loader, Settings, Zap } from "lucide-react";
import "@membranehq/react/styles.css";
import Image from "next/image";
import { Integration } from "@membranehq/sdk";
import axios from "axios";
import { useIntegrationConnection } from "@/components/sync-config-modal/use-integration-connection";
import { CustomDataSourceConfiguration } from "./custom-data-source-configuration";
import { CustomFieldMappingConfiguration } from "./custom-field-mapping-configuration";
import appObjects, { categoryIcons } from "@/lib/app-objects";
import { SelectionGroup } from "./selection-group";
import { useDataSourceAppliedIntegrations } from "@/hooks/use-applied-integrations";
import { SelectionGroupWrapper } from "./selection-group-wrapper";
import { mutate } from "swr";

function SyncConfigModal({ trigger }: { trigger: React.ReactNode }) {
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [selectedAppObjectKey, setSelectedAppObjectKey] = useState<
    string | undefined
  >();
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showDataSourceConfig, setShowDataSourceConfig] = useState(false);
  const [showFieldMappingConfig, setShowFieldMappingConfig] = useState(false);

  const {
    data: connection,
    isConnecting,
    connect,
    isLoading: isConnectionLoading,
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
      await axios.post("/api/sync", {
        integrationKey: selectedIntegration?.key,
        appObjectKey: selectedAppObjectKey,
        instanceKey: instanceKey.current,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      mutate("/api/sync");

      setOpen(false);
    } catch (error) {
      console.error("Failed to start sync:", error);
      toast.error("Failed to start sync");
    } finally {
      setSyncing(false);
    }
  };

  const appObjectsItems = Object.keys(appObjects).map((key) => ({
    id: key,
    key: key,
    name: appObjects[key as keyof typeof appObjects].label,
    icon: appObjects[key as keyof typeof appObjects].icon,
    category: appObjects[key as keyof typeof appObjects].category,
  }));

  const {
    integrations,
    loading: integrationsLoading,
    error: integrationsError,
  } = useDataSourceAppliedIntegrations(selectedAppObjectKey ?? null);

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
      <DialogContent className="h-[700px] flex flex-col pb-0 max-w-4xl">
        <DialogTitle className="flex flex-col gap-1">
          <span className="flex items-center gap-2">Configure Sync</span>
          <span className="text-sm font-normal text-muted-foreground">
            Set up bidirectional object sync across integrations
          </span>
        </DialogTitle>
        <div className="p-3 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 w-full mt-4 overflow-y-auto">
            <SelectionGroupWrapper
              title="Select Object"
              description="Choose from objects across different categories"
              icon={Database}
              className="pb-3"
              size="sm"
            >
              <SelectionGroup
                items={appObjectsItems}
                selectedKey={selectedAppObjectKey ?? null}
                onItemSelect={(key) => {
                  if (selectedIntegration) setSelectedIntegration(null);
                  setSelectedAppObjectKey(key);
                }}
                visibleCount={3}
                categoryIcons={categoryIcons}
                onCategorySelect={() => {
                  setSelectedAppObjectKey(undefined);
                  if (selectedIntegration) setSelectedIntegration(null);
                }}
              />
            </SelectionGroupWrapper>

            <SelectionGroupWrapper
              title="Select Integration"
              description="Select the integration you want to sync with"
              icon={Zap}
              showEmptyMessage={!selectedAppObjectKey}
              emptyMessage="All applicable integrations will appear here after object selection"
              className="pb-3"
              size="sm"
            >
              {!selectedAppObjectKey ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center text-gray-500 text-sm">
                  <p>Integration list will appear when you select object</p>
                </div>
              ) : integrationsError ? (
                <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center text-red-600 text-sm">
                  <p className="font-medium">Failed to load integrations</p>
                  <p className="text-xs mt-1 text-red-500">
                    {integrationsError.message}
                  </p>
                </div>
              ) : (
                <SelectionGroup
                  items={integrationItems}
                  selectedKey={selectedIntegration?.key ?? null}
                  onItemSelect={(key) => {
                    const integration = integrations.find((i) => i.key === key);
                    if (integration) setSelectedIntegration(integration);
                  }}
                  visibleCount={3}
                  loading={integrationsLoading}
                />
              )}
            </SelectionGroupWrapper>
            {/* 3: Connect Button (Visible if integration selected has no connection) */}
            {!!selectedIntegration && !connection && (
              <SelectionGroupWrapper
                title="Connect Integration"
                icon={Zap}
                className="pb-3"
                size="sm"
              >
                {isConnectionLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Checking connection status...
                  </div>
                ) : (
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
                    {isConnecting && (
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                    )}
                    Connect {selectedIntegration.name}{" "}
                    <Image
                      className="r"
                      width={16}
                      height={16}
                      src={selectedIntegration.logoUri}
                      alt={selectedIntegration.name}
                    />
                  </Button>
                )}
              </SelectionGroupWrapper>
            )}

            {/* Advanced Configuration Container */}
            {!!selectedAppObjectKey && !!connection?.id && (
              <div className="pr-4">
                {/* Divider between basic and advanced configuration */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <div className="px-4 text-sm text-muted-foreground bg-white">
                    Advanced Configuration
                  </div>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                {/* 4: Data Source Configuration Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Object Configuration
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Configure
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setShowDataSourceConfig(!showDataSourceConfig)
                        }
                        aria-label={`${showDataSourceConfig ? "Hide" : "Show"
                          } data source configuration`}
                        title={`${showDataSourceConfig ? "Hide" : "Show"
                          } data source configuration`}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${showDataSourceConfig ? "bg-primary" : "bg-gray-200"}
                          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${showDataSourceConfig
                              ? "translate-x-6"
                              : "translate-x-1"
                            }
                          `}
                        />
                      </button>
                    </div>
                  </div>

                  {!showDataSourceConfig && (
                    <div className="text-sm text-muted-foreground mb-4 ml-6">
                      <p>
                        Configure Object parameters and change the data
                        collection used
                      </p>
                    </div>
                  )}
                </div>

                {/* 5: Data Source Configuration Section (shown when toggled) */}
                {showDataSourceConfig && (
                  <div className="ml-6">
                    <CustomDataSourceConfiguration
                      instanceKey={instanceKey.current}
                      integrationKey={selectedIntegration?.key}
                      dataSourceKey={selectedAppObjectKey}
                      connectionId={connection.id}
                    />
                  </div>
                )}

                {/* 6: Field Mapping Configuration Toggle */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Field Mapping Configuration
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Configure
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setShowFieldMappingConfig(!showFieldMappingConfig)
                        }
                        aria-label={`${showFieldMappingConfig ? "Hide" : "Show"
                          } field mapping configuration`}
                        title={`${showFieldMappingConfig ? "Hide" : "Show"
                          } field mapping configuration`}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${showFieldMappingConfig
                            ? "bg-primary"
                            : "bg-gray-200"
                          }
                          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${showFieldMappingConfig
                              ? "translate-x-6"
                              : "translate-x-1"
                            }
                          `}
                        />
                      </button>
                    </div>
                  </div>

                  {!showFieldMappingConfig && (
                    <div className="text-sm text-muted-foreground mb-4 ml-6">
                      <p>
                        Configure how fields from your app map to fields in the
                        integration and vice versa for custom data
                        transformation.
                      </p>
                    </div>
                  )}
                </div>

                {/* 7: Field Mapping Configuration Section (shown when toggled) */}
                {showFieldMappingConfig && (
                  <div className="ml-6">
                    <CustomFieldMappingConfiguration
                      instanceKey={instanceKey.current}
                      integrationKey={selectedIntegration?.key}
                      fieldMappingKey={selectedAppObjectKey}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Modal Footer */}
        <div className="w-full border-t bg-white p-3 flex justify-end">
          <Button
            type="button"
            className="bg-primary text-white font-semibold hover:bg-primary/90 transition"
            disabled={
              !selectedIntegration ||
              !selectedAppObjectKey ||
              syncing ||
              !connection?.id
            }
            onClick={startSync}
          >
            {syncing && <Loader className="w-4 h-4 animate-spin mr-2" />}
            Start syncing <Download className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog >
  );
}

export { SyncConfigModal };
