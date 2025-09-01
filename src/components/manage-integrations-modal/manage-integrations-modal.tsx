'use client';

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useConnections } from '@membranehq/react';
import { Plug } from 'lucide-react';
import { cn } from '@/lib/fetch-utils';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UnconnectedIntegrations } from './unconnected-integrations';
import { ConnectedIntegrations } from './connected-integrations';

interface ManageIntegrationsModalProps {
  trigger?: ReactNode;
}

export function ManageIntegrationsModal({ trigger }: ManageIntegrationsModalProps) {
  const [open, setOpen] = useState(false);
  const { connections, loading: connectionsIsLoading } = useConnections();

  const hasConnectedIntegration = connections.some(
    (connection) => !connection.disconnected,
  );

  const defaultTrigger = (
    <Button
      size="icon"
      variant="outline"
      className="relative w-10 h-10 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Plug className="w-4 h-4" />
      {!connectionsIsLoading && (
        <div
          className={cn(
            'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background',
            hasConnectedIntegration ? 'bg-green-500' : 'bg-red-500',
          )}
        />
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="pl-2">
          <DialogTitle>Manage Apps</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Connect to third-party apps and access their tools
          </p>
        </DialogHeader>
        <div className="overflow-y-auto h-[70vh]">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-2 space-y-6">
              <ConnectedIntegrations />
              <UnconnectedIntegrations />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
