import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import type { ISync } from "@/models/types";
import Link from "next/link";
import Image from "next/image";
import { useIntegrations } from "@integration-app/react";
import {
  ListTree,
  FileText,
  Image as ImageIcon,
  CheckIcon,
  Loader2Icon,
  XIcon,
  HashIcon,
  ClockIcon,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import type { FC } from "react";
import { formatDistanceToNow } from "date-fns";

// Fetcher with authorization header
const fetcher = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch syncs");
  return res.json();
};

// Map datasource keys to icons
const datasourceKeyToIcon: Record<string, FC<React.SVGProps<SVGSVGElement>>> = {
  "content-items": ListTree,
  documents: FileText,
  images: ImageIcon,
};

interface SyncItemProps {
  sync: ISync & { _id: string, recordCount: number };
  logoUri?: string;
  integrationName?: string;
}

// Renders a single sync item row
function SyncItem({ sync, logoUri, integrationName }: SyncItemProps) {
  const Icon = datasourceKeyToIcon[sync.dataSourceKey];

  // Helper to render sync status icon
  const renderStatusIcon = () => {
    switch (sync.status) {
      case "completed":
        return <CheckIcon className="w-4 h-4 text-green-500" />;
      case "pending":
      case "in_progress":
        return <Loader2Icon className="w-4 h-4 animate-spin text-blue-500" />;
      case "failed":
        return <XIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Link
      key={sync.integrationKey + sync.dataSourceKey + sync._id}
      href={`/dashboard/sync/${sync._id}`}
      className="block group"
    >
      <div className="flex flex-row items-center gap-2 border-b border-gray-200 hover:bg-muted/70 cursor-pointer transition-colors py-4 px-2">
        {/* Integration logo or fallback */}
        <div className="flex-shrink-0">
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
            <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize flex items-center gap-1">
              {renderStatusIcon()}
              {sync.status}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2 mt-1">
            {/* Data Source Key Badge */}
            <span className="flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs font-medium">
              {Icon && (
                <Icon
                  width={14}
                  height={14}
                  className="text-muted-foreground"
                />
              )}
              {sync.dataSourceKey}
            </span>
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
            {sync.error && (
              <span
                className="flex items-center gap-1 bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-medium max-w-xs truncate cursor-pointer relative group"
                title={sync.error}
              >
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="font-medium">Error:</span>
                <span className="truncate max-w-[120px] inline-block align-bottom">
                  {sync.error}
                </span>
              </span>
            )}
          </div>
        </div>
        {/* Animated arrow on hover */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1 pr-4">
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}

export function Syncs() {
  const { getToken } = useAuth();
  const { integrations } = useIntegrations();

  // SWR fetch with polling and auth
  const { data, error, isLoading } = useSWR<{ data: (ISync & { _id: string, recordCount: number })[] }>(
    ["/api/sync", "token"],
    async ([url]) => {
      const token = await getToken();
      return fetcher(url, token!);
    },
    {
      refreshInterval: 5000, // Poll every 5 seconds
    }
  );

  if (isLoading) return <div>Loading syncs...</div>;
  if (error) return <div className="text-red-500">Failed to load syncs</div>;
  if (!data?.data?.length) return <div>No syncs found.</div>;

  return (
    <div className="flex flex-col">
      {data.data.map((sync) => {
        const integration = integrations.find(
          (i) => i.key === sync.integrationKey
        );
        return (
          <SyncItem
            key={sync.integrationKey + sync.dataSourceKey + sync._id}
            sync={sync}
            logoUri={integration?.logoUri}
            integrationName={integration?.name}
          />
        );
      })}
    </div>
  );
}
