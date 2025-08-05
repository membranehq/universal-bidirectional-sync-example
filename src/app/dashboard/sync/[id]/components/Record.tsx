"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Copy,
  ChevronDown,
  ChevronRight,
  Hash,
  Trash2,
  MoreHorizontal,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { IRecord } from "@/models/types";
import { SyncStatusObject } from "@/models/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import recordTypesConfig from "@/lib/record-type-config";

interface RecordProps {
  record: IRecord;
  index: number;
  onRecordDeleted?: (recordId: string) => void;
  onEditRecord?: (record: IRecord) => void;
  recordType: string;
}

const getSyncStatusIcon = (status: string) => {
  switch (status) {
    case SyncStatusObject.COMPLETED:
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case SyncStatusObject.FAILED:
      return <XCircle className="w-4 h-4 text-red-500" />;
    case SyncStatusObject.IN_PROGRESS:
      return <Clock className="w-4 h-4 text-blue-500" />;
    case SyncStatusObject.PENDING:
      return <Clock className="w-4 h-4 text-gray-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};

export function Record({
  record,
  onRecordDeleted,
  onEditRecord,
  recordType,
}: RecordProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(record.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${recordType}? This action cannot be undone.`
    );
    if (confirmed) {
      onRecordDeleted?.(record._id);
    }
  };

  const handleEdit = () => {
    onEditRecord?.(record);
  };

  const renderRecordTypeComponent = () => {
    const recordTypeConfig =
      recordTypesConfig[recordType as keyof typeof recordTypesConfig];
    const RecordComponent = recordTypeConfig?.component;

    if (RecordComponent) {
      return <RecordComponent record={record} />;
    }

    return (
      <>
        <div className="py-3 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Hash className="w-3 h-3 mr-1" />
            {record._id}
          </div>
        </div>
        <div className="flex-1 px-4 py-3 whitespace-nowrap text-sm">
          {record.name || "N/A"}
        </div>
        <div className="flex-1 px-4 py-3 whitespace-nowrap text-sm">
          {record.createdAt
            ? new Date(record.createdAt).toLocaleDateString()
            : "N/A"}
        </div>
        <div className="flex-1 px-4 py-3 whitespace-nowrap text-sm">
          {record.updatedAt
            ? new Date(record.updatedAt).toLocaleDateString()
            : "N/A"}
        </div>
      </>
    );
  };

  return (
    <div className="border-b border-border hover:bg-muted/50 transition-colors">
      {/* Main row */}
      <div className="flex items-center">
        <div className=" px-4 py-3 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              onClick={toggleExpanded}
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {renderRecordTypeComponent()}

        <div className="px-4 py-3 text-right sticky right-0 bg-background">
          <div className="flex items-center justify-end gap-1">
            <div className="flex items-center gap-2 mr-2">
              {!record.syncError && getSyncStatusIcon(record.syncStatus)}
              {record.syncError && (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-semibold">Sync Error:</p>
                        <p className="text-xs">{record.syncError}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    onClick={handleCopy}
                    aria-label="Copy record JSON"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {copied ? "Copied!" : "Copy JSON"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {recordTypesConfig[recordType as keyof typeof recordTypesConfig]
                  ?.allowUpdate && (
                  <DropdownMenuItem
                    onClick={handleEdit}
                    className="flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit {recordType}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {recordType}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 py-3 bg-muted/30">
          <div className="space-y-3">
            <pre className="whitespace-pre-wrap break-all bg-gray-100 rounded p-3 text-xs border">
              {JSON.stringify(record.data, null, 2)}
            </pre>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>Created:</span>
                <span>
                  {record.createdAt
                    ? new Date(record.createdAt).toLocaleString()
                    : "N/A"}
                </span>
                <span>•</span>
                <span>Updated:</span>
                <span>
                  {record.updatedAt
                    ? new Date(record.updatedAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              {record.syncError && (
                <div className="text-red-500">
                  <span className="font-semibold">Sync Error:</span>{" "}
                  {record.syncError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
