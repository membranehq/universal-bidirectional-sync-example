"use client";

import { Button } from "@/components/ui/button";
import { Syncs } from "./components/syncs";
import { SyncConfigModal } from "./components/sync-config-modal";
import { ManageIntegrationsModal } from "./components/manage-integrations-modal/manage-integrations-modal";
import { DownloadIcon } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="w-full">
      <div className="flex items-center justify-between w-full mx-auto py-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your integrations and syncs in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <SyncConfigModal trigger={<Button><DownloadIcon className="mr-2 h-4 w-4" />Configure Sync</Button>} />
          <ManageIntegrationsModal />
        </div>
      </div>
      <Syncs />
    </main>
  );
}
