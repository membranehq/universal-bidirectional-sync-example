"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useIntegrationApp,
  Connection,
  IntegrationAppClientProvider,
} from "@integration-app/react";
import { useState, useEffect, useRef } from "react";
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
import { CircleCheck, CircleDashed, Download, Loader } from "lucide-react";
import { IntegrationSelect } from "./integration-select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DataInput,
  useFieldMappingInstance,
  useDataSourceInstance,
  IntegrationAppConnectionProvider,
} from "@integration-app/react";
import "@integration-app/react/styles.css";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel } from "@/components/ui/form-label";


import { Integration, DataSource, DataSourceInstance } from "@integration-app/sdk";
import { getSingularForm } from "@/lib/pluralize-utils";

// SectionWithStatus component
function SectionWithStatus({
  done,
  children,
}: {
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <span className="">
        {done ? (
          <CircleCheck className="w-5 h-5 bg-green-600 text-white rounded-full" />
        ) : (
          <CircleDashed className="text-gray-300 w-5 h-5" />
        )}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function CustomDataSourceConfiguration({
  instanceKey,
  integrationKey,
  dataSourceKey,
  connectionId,
  onDataSourceInstanceChange,
}: {
  instanceKey: string;
  integrationKey?: string;
  dataSourceKey: string;
  connectionId: string;
  onDataSourceInstanceChange: (dataSourceInstance: DataSourceInstance) => void;
}) {
  const client = useIntegrationApp();

  const { dataSourceInstance, loading, error, patch } = useDataSourceInstance({
    integrationKey: integrationKey,
    dataSourceKey: dataSourceKey,
    instanceKey: instanceKey,
    autoCreate: true,
  });

  useEffect(() => {
    if (dataSourceInstance) {
      onDataSourceInstanceChange(dataSourceInstance);
    }
  }, [dataSourceInstance]);


  if (loading) return <Skeleton className="h-10 w-2/3" />;
  if (error) return <div>Error: {error.message}</div>;
  if (!dataSourceInstance) return <div>No data source instance</div>;
  if (dataSourceInstance?.collectionParameters && !Object.keys(dataSourceInstance?.collectionParameters).length) return null;

  const hasRequiredParameters =
    (dataSourceInstance?.collectionSpec?.parametersSchema?.required?.length ||
      0) > 0;

  const requiredFieldsAreFilled = false;

  return (
    <IntegrationAppClientProvider client={client}>
      <IntegrationAppConnectionProvider connectionId={connectionId}>
        <SectionWithStatus done={hasRequiredParameters ? requiredFieldsAreFilled : true}>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <FormLabel
                label="Configure Data Source"
                tooltip="Configure any required parameters for the selected data source."
                size="sm"
                className="mb-1"
              />
              {hasRequiredParameters && (
                <span className="text-xs font-semibold text-amber-500 mb-1 ">
                  Has Required Parameters
                </span>
              )}
            </div>
            <DataInput
              schema={dataSourceInstance.collectionSpec?.parametersSchema ?? {}}
              value={dataSourceInstance.collectionParameters}
              variablesSchema={
                dataSourceInstance.collectionSpec?.parametersSchema ?? {}
              }
              onChange={(importValue: unknown) =>
                patch({ collectionParameters: importValue })
              }
            />
          </div>
        </SectionWithStatus>
      </IntegrationAppConnectionProvider>
    </IntegrationAppClientProvider>
  );
}

function CustomFieldMappingConfiguration({
  instanceKey,
  integrationKey,
  fieldMappingKey,
}: {
  instanceKey: string;
  integrationKey?: string;
  fieldMappingKey: string;
}) {
  const { fieldMappingInstance, patch, loading, error } =
    useFieldMappingInstance({
      integrationKey: integrationKey,
      fieldMappingKey: fieldMappingKey,
      instanceKey: instanceKey,
      autoCreate: true,
    });

  const [showConfig, setShowConfig] = useState(true);

  if (loading) return <Skeleton className="h-10 w-2/3" />;
  if (error) return <div>Error: {error.message}</div>;
  if (!fieldMappingInstance) return <div>No field mapping instance</div>;

  return (
    <SectionWithStatus done={true}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between mb-1">
          <FormLabel
            label="Configure Field Mapping"
            tooltip="Customize how fields from the data source map to your local schema."
            size="sm"
          />
          <label className="flex items-center gap-1 text-xs font-medium cursor-pointer select-none">
            <Checkbox
              checked={showConfig}
              onCheckedChange={() => setShowConfig((v) => !v)}
            />
            Customize configuration
          </label>
        </div>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${showConfig ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 pointer-events-none'}`}
          style={{ willChange: 'opacity, max-height' }}
        >
          {showConfig && (
            <DataInput
              schema={fieldMappingInstance.appSchema!}
              value={fieldMappingInstance.importValue}
              variablesSchema={fieldMappingInstance.externalSchema}
              onChange={(importValue: unknown) => patch({ importValue })}
            />

          )}
        </div>
      </div>
    </SectionWithStatus>
  );
}

function SyncConfigModal({ trigger }: { trigger: React.ReactNode }) {
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dataSourcesLoading, setDataSourcesLoading] = useState(false);
  const [selectedDataSourceKey, setSelectedDataSourceKey] = useState<string>("");
  const [connection, setConnection] = useState<Connection | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { getToken } = useAuth();
  const integrationApp = useIntegrationApp();
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [dataSourceInstance, setDataSourceInstance] = useState<DataSourceInstance | null>(null);

  const instanceKey = useRef(uuidv4());

  //1. Check if there's a connection to the selected integration
  useEffect(() => {
    console.log("fetching connection");
    setConnection(null);
    const fetchConnection = async () => {
      if (!selectedIntegration) {
        setConnection(null);
        return;
      }
      const connection = await integrationApp.connections.find({
        integrationKey: selectedIntegration.key,
      });
      if (connection.items.length > 0) setConnection(connection.items[0]);
    };
    fetchConnection();
  }, [selectedIntegration]);

  //2. Populate data sources for the selected integration
  useEffect(() => {
    console.log("fetching data sources");
    const fetchDataSources = async () => {
      if (selectedIntegration && connection) {
        setDataSourcesLoading(true);
        try {
          const sources = await integrationApp.dataSources.findAll({
            integrationId: selectedIntegration.id,
          });
          setDataSources(sources);
          setSelectedDataSourceKey("");
        } catch (err) {
          console.error(err);
        } finally {
          setDataSourcesLoading(false);
        }
      } else {
        setDataSources([]);
        setSelectedDataSourceKey("");
        setDataSourcesLoading(false);
      }
    };
    fetchDataSources();
  }, [selectedIntegration, connection]);

  const startSync = async () => {
    setSyncing(true);
    try {
      const token = await getToken();
      if (!selectedDataSourceKey) {
        toast.error("No data source selected");
        setSyncing(false);
        return;
      }
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integrationKey: selectedIntegration?.key,
          recordType: getSingularForm(selectedDataSourceKey),
          instanceKey: instanceKey.current,
        }),
      });
      if (!response.ok) {
        toast.error("Failed to start sync");
      }
      const data = await response.json();
      console.log(data);
      setOpen(false);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="h-[600px] flex flex-col pb-0">
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

            {/* section 1: Integration Select (Always visible) */}
            <SectionWithStatus done={!!selectedIntegration}>
              <IntegrationSelect
                value={selectedIntegration}
                onValueChange={setSelectedIntegration}
                label="Select Integration"
              />
            </SectionWithStatus>

            {/* section 2: Connect Button (Visible if integration selected and no connection) */}
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
                    disabled={connecting}
                    onClick={async () => {
                      setConnecting(true);
                      try {
                        if (!selectedIntegration?.key) return;
                        const connection = await integrationApp
                          .integration(selectedIntegration.key)
                          .openNewConnection();
                        if (connection) {
                          setConnection(connection);
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setConnecting(false);
                      }
                    }}
                  >
                    Connect <Image
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

            {/* section 3: Data Source Select (Visible if connection exists) */}
            {!!connection && (
              <SectionWithStatus done={!!selectedDataSourceKey}>
                <div className="flex flex-col w-full max-w-xs">
                  <FormLabel
                    label="Select Object"
                    tooltip="Choose which data source to sync from the selected integration."
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
                          <SelectValue placeholder="Choose a data source">
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

            {/* section 4: Configure Data Source Button (Visible if data source selected) */}
            {!!selectedDataSourceKey && !!connection?.id && (
              <CustomDataSourceConfiguration
                onDataSourceInstanceChange={(dataSourceInstance) => setDataSourceInstance(dataSourceInstance)}
                instanceKey={instanceKey.current}
                integrationKey={selectedIntegration?.key}
                dataSourceKey={selectedDataSourceKey}
                connectionId={connection.id}
              />
            )}

            {/* section 5: Configure Field Mapping Button (Visible if data source selected) */}
            {!!selectedDataSourceKey && !!connection?.id && !!dataSourceInstance && (
              <CustomFieldMappingConfiguration
                instanceKey={instanceKey.current}
                integrationKey={selectedIntegration?.key}
                fieldMappingKey={selectedDataSourceKey}
              />
            )}
          </form>
        </div >
        {/* Modal Footer */}
        < div className="w-full border-t bg-white p-3 flex justify-end" >
          <Button
            type="button"
            className="bg-primary text-white font-semibold hover:bg-primary/90 transition"
            disabled={!selectedIntegration || !selectedDataSourceKey || syncing}
            onClick={startSync}
          >
            {syncing ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <>
                Sync <Download className="w-4 h-4" />
              </>
            )}
          </Button>
        </div >
      </DialogContent >
    </Dialog >
  );
}


export { SyncConfigModal };
