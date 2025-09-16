"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Syncs } from "@/components/syncs";
import { DownloadIcon, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SyncConfigModal } from "@/components/sync-config-modal/sync-config-modal";
import { ManageIntegrationsModal } from "@/components/manage-integrations-modal/manage-integrations-modal";
import { ObjectSlideshow } from "@/components/ObjectSlideshow";
import { useAuth } from "./contexts/auth-context";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  } else if (hour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

export default function DashboardPage() {
  const { isLoading } = useAuth();
  const [isSyncsEmpty, setIsSyncsEmpty] = useState(false);

  return (
    <main className="w-full">
      <div className="flex items-center justify-between w-full mx-auto py-8">
        <div className="space-y-2">
          {isLoading ? (
            <Skeleton className="h-9 w-32" />
          ) : (
            <div className="text-2xl font-normal text-gray-800 mb-0 font-serif italic">
              {getGreeting()},
            </div>
          )}
          <div className="flex items-center gap-2">
            <p className="text-lg text-muted-foreground font-medium">
              What do you want to sync today?
            </p>
            <ObjectSlideshow />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isSyncsEmpty && (
            <SyncConfigModal
              trigger={
                <Button className=" text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Configure Sync
                </Button>
              }
            />
          )}
          <ManageIntegrationsModal />
        </div>
      </div>
      <Syncs onEmptyStateChange={setIsSyncsEmpty} />
    </main>
  );
}
