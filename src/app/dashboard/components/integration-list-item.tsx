"use client";

import { Integration } from "@integration-app/sdk";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useIntegrationApp } from "@integration-app/react";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";
import { startSync } from "@/lib/integration-api";
import { cn } from "@/lib/utils";


interface IntegrationListItemProps {
  integration: Integration;
  onRefresh: () => Promise<void>;
}

export function IntegrationListItem({
  integration,
  onRefresh,
}: IntegrationListItemProps) {
  const integrationApp = useIntegrationApp();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleStartSync = async () => {
    try {
      await startSync(integration.key);
    } catch (error) {
      toast.error("Failed to sync documents", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleConnect = async ({ syncAfterConnect = true }: { syncAfterConnect: boolean }) => {
    try {
      setIsConnecting(true);

      const connection = await integrationApp
        .integration(integration.key)
        .openNewConnection();

      if (!connection?.id) {
        throw new Error("Connection was not successful");
      }

      setIsConnecting(false);


      const shouldSyncAfterConnect = syncAfterConnect

      if (shouldSyncAfterConnect) {
        handleStartSync();
      }

    } catch (error) {
      setIsConnecting(false);

      toast.error("Failed to connect", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleDisconnect = async () => {
    if (!integration.connection?.id) {
      return;
    }

    try {
      setIsDisconnecting(true);
      await fetch(`/api/documents/${integration.key}`, {
        method: "DELETE",

      });

      await integrationApp.connection(integration.connection.id).archive();

      await onRefresh();
    } catch (error) {
      toast.error("Failed to disconnect", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isDisconnected = integration.connection?.disconnected;

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between p-4 pl-0 bg-white rounded-lg border-b",
        )}
      >
        <div className="flex items-center gap-4">
          {integration.logoUri ? (
            <Image
              width={40}
              height={40}
              src={integration.logoUri}
              alt={`${integration.name} logo`}
              className="w-10 h-10 rounded-lg"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              {integration.name[0]}
            </div>
          )}

          <div className="flex gap-2 items-center">
            <h3 className="font-medium">{integration.name}</h3>
            {isDisconnected && (
              <p className="text-sm font-bold text-red-500 ">
                Disconnected
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {integration.connection ? (
            <>
              {isDisconnected ? (
                <Button
                  variant="ghost"
                  onClick={() => handleConnect({ syncAfterConnect: false })}
                  size="sm"
                  disabled={isConnecting}
                >
                  <span className="font-bold">Reconnect</span>
                  {isConnecting && <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleDisconnect}
                  size="sm"
                  disabled={isDisconnecting}
                >
                  <span className="text-red-500">Disconnect</span>
                  {isDisconnecting && <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />}
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={() => handleConnect({ syncAfterConnect: true })}
              variant="default"
              size="sm"
              disabled={isConnecting}
            >
              Connect {isConnecting && <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
