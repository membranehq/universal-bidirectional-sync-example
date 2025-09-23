import React from "react";
import useSWR from "swr";
import type { ISync } from "@/models/types";
import Link from "next/link";
import Image from "next/image";
import { Loader } from "@/components/ui/loader";

import {
  HashIcon,
  ClockIcon,
  ChevronRight,
  AlertCircle,
  Database,
  Settings2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppObjectBadge } from "@/components/ui/app-object-badge";
import axios from "axios";
import { SyncConfigModal } from "@/components/sync-config-modal/sync-config-modal";
import { Button } from "@/components/ui/button";

interface SyncItemProps {
  sync: ISync & { _id: string; recordCount: number };
  logoUri?: string;
  integrationName?: string;
}

function SyncItem({ sync, logoUri, integrationName }: SyncItemProps) {
  return (
    <Link
      key={sync.integrationKey + sync.appObjectKey + sync._id}
      href={`/syncs/${sync._id}`}
      className="block group"
    >
      <div className="flex items-center flex-row gap-2 border-b border-gray-200 hover:bg-muted/70 cursor-pointer transition-colors py-4 px-2">
        <div className="flex-shrink-0 self-start">
          {logoUri ? (
            <Image
              src={logoUri}
              alt={`${integrationName || sync.integrationKey} logo`}
              width={24}
              height={24}
              className="w-6 h-6 rounded-lg object-cover bg-gray-100"
            />
          ) : (
            <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs">
              {integrationName}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text font-semibold truncate">
              {integrationName || sync.integrationKey}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2 mt-1">
            {/* Data Source Key Badge */}
            <AppObjectBadge appObjectKey={sync.appObjectKey} />
            {/* Record Count Badge */}
            <span className="flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs font-medium">
              <HashIcon
                width={14}
                height={14}
                className="text-muted-foreground"
              />
              {sync.recordCount}
            </span>
            {/* Created At Badge */}
            <span className="flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs font-medium">
              <ClockIcon
                width={14}
                height={14}
                className="text-muted-foreground"
              />
              {sync.createdAt
                ? formatDistanceToNow(new Date(sync.createdAt), {
                  addSuffix: true,
                })
                : "N/A"}
            </span>

          </div>
        </div>
        {sync.pullError && (
          <span
            className="flex items-center gap-1 bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-medium max-w-xs truncate cursor-pointer relative group"
            title={sync.pullError}
          >
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="font-medium">Error:</span>
            <span className="truncate max-w-[120px] inline-block align-bottom">
              {sync.pullError}
            </span>
          </span>
        )}
        <div className="flex-shrink-0 flex items-center gap-2">
          <StatusBadge status={sync.status} />
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  );
}

interface SyncsProps {
  onEmptyStateChange?: (isEmpty: boolean) => void;
}

export function Syncs({ onEmptyStateChange }: SyncsProps = {}) {
  const { data, error, isLoading } = useSWR<{
    data: (ISync & { _id: string; recordCount: number })[];
  }>(
    ["/api/syncs", "token"],
    async ([url]) => {
      const response = await axios.get(url);
      return response.data;
    },
    {
      refreshInterval: 5000,
    }
  );

  // Notify parent about empty state
  React.useEffect(() => {
    if (data && !isLoading) {
      onEmptyStateChange?.(!data?.data?.length);
    }
  }, [data, isLoading, onEmptyStateChange]);

  if (isLoading) return <Loader message="Loading syncs..." />;
  if (error) return <div className="text-red-500">Failed to load syncs</div>;
  if (!data?.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Database className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No syncs yet
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Get started by connecting your first integration and creating a sync
          to begin synchronizing your data.
        </p>
        <SyncConfigModal
          trigger={
            <Button className=" text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Settings2 className="mr-2 h-4 w-4" />
              Configure Sync
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {data.data.map((sync) => {
        return (
          <SyncItem
            key={sync.integrationKey + sync.appObjectKey + sync._id}
            sync={sync}
            logoUri={sync.integrationLogoUri}
            integrationName={sync.integrationName}
          />
        );
      })}
    </div>
  );
}
