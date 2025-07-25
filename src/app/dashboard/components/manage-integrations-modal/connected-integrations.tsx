'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useConnections } from '@integration-app/react';
import { AlertCircle, Loader2, RefreshCw, Plug2 } from 'lucide-react';
import Image from 'next/image';
import { useIntegrationApp, type Integration } from '@integration-app/react';
import { toast } from 'sonner';

interface IntegrationListItemProps {
  integration: Integration;
  onRefresh: () => Promise<void>;
}

function ConnectedIntegrationItem({
  integration,
  onRefresh,
}: IntegrationListItemProps) {
  const integrationApp = useIntegrationApp();

  const [isDisconnecting, setIsDisconnecting] = useState(false);


  const handleDisconnect = async () => {
    if (!integration.connection?.id) {
      return;
    }

    try {
      setIsDisconnecting(true);

      await integrationApp.connection(integration.connection.id).archive();

      await onRefresh();
    } catch (error) {
      toast.error('Failed to disconnect', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isDisconnected = integration.connection?.disconnected;

  return (
    <>
      <div className="flex flex-col p-3 border rounded-lg hover:bg-muted/50 transition-colors relative">
        <div className="flex items-center gap-3 pb-3">
          {integration.logoUri ? (
            <Image
              width={32}
              height={32}
              src={integration.logoUri}
              alt={`${integration.name} logo`}
              className="size-8 rounded-lg shrink-0"
            />
          ) : (
            <div className="size-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium shrink-0">
              {integration.name[0]}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{integration.name}</h3>
            {isDisconnected && (
              <p className="text-xs font-bold text-red-500">Disconnected</p>
            )}
            {integration.connection && !isDisconnected && (
              <div className="flex text-xs text-muted-foreground items-center gap-1 mt-1">
                {integration.key}
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex justify-between items-end">
          <Button
            variant="outline"
            onClick={handleDisconnect}
            size="sm"
            disabled={isDisconnecting}
            className="text-xs h-7 py-1 text-red-500 hover:text-red-600"
          >
            {isDisconnecting ? <Loader2 className="size-3" /> : 'Disconnect'}
          </Button>
        </div>
      </div>


    </>
  );
}


export function ConnectedIntegrations() {

  const {
    connections,
    refresh: refreshConnections,
    loading: connectionsIsLoading,
    error: connectionsError,
  } = useConnections();

  // Get connected integrations from connections
  const connectedIntegrations = connections
    .map((connection) => {
      const integration = connection.integration;
      if (integration) {
        return {
          ...integration,
          connection: connection,
        } as Integration;
      }
      return undefined;
    })
    .filter(
      (integration): integration is Integration => integration !== undefined,
    );






  const refresh = async () => {
    await refreshConnections();
  };

  if (connectionsIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading connections...</p>
      </div>
    );
  }

  if (connectionsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle />
        <p className="text-sm text-muted-foreground mb-4">
          {connectionsError.message || 'Failed to load connections'}
        </p>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
          <RefreshCw /> Try again
        </Button>
      </div>
    );
  }

  if (connectedIntegrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
        <Plug2 className="size-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          No connected apps yet
        </p>
        <p className="text-xs text-muted-foreground/70 text-center mt-1">
          Connect apps below to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Connected Apps ({connectedIntegrations.length})
          </h3>

        </div>

      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-3">
        {connectedIntegrations.map((integration) => (
          <ConnectedIntegrationItem
            key={integration.key}
            integration={integration}
            onRefresh={refresh}
          />
        ))}
      </div>
    </div>
  );
}
