"use client";

import { Button } from "@/components/ui/button";
import { Syncs } from "./components/syncs";
import { SyncConfigModal } from "./components/sync-config-modal/sync-config-modal";
import { ManageIntegrationsModal } from "./components/manage-integrations-modal/manage-integrations-modal";
import { DownloadIcon } from "lucide-react";
import { useClerkAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isLoaded } = useClerkAuth();
  return (
    <main className="w-full">
      <div className="flex items-center justify-between w-full mx-auto py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {!isLoaded ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <>
                <span className="font-normal text-gray-500">Hi{user?.firstName ? ", " : ""}</span>
                {user?.firstName && <span className="font-serif italic">{user.firstName}</span>}
              </>
            )}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">What do you want to sync today?</p>
        </div>
        <div className="flex items-center gap-3">
          <SyncConfigModal trigger={<Button className=" text-white shadow-lg hover:shadow-xl transition-all duration-200"><DownloadIcon className="mr-2 h-4 w-4" />Configure Sync</Button>} />
          <ManageIntegrationsModal />
        </div>
      </div>
      <Syncs />
    </main>
  );
}
