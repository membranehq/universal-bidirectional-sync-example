"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, ChevronDown, ChevronRight, Hash, Trash2, Loader2, MoreHorizontal, Edit, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import type { IRecord } from "@/models/types";
import { SyncStatusObject } from "@/models/types";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditRecordDialog } from "./EditRecordDialog";
import recordTypesConfig from "@/lib/record-type-config";

interface RecordProps {
  record: IRecord,
  index: number;
  onRecordDeleted?: (recordId: string) => void;
  onRecordUpdated?: () => void;

  syncId: string;
  recordType: string;
}

const getSyncStatusIcon = (status: string) => {
  switch (status) {
    case SyncStatusObject.COMPLETED:
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case SyncStatusObject.FAILED:
      return <XCircle className="w-4 h-4 text-red-500" />;
    case SyncStatusObject.IN_PROGRESS:
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    case SyncStatusObject.PENDING:
      return <Clock className="w-4 h-4 text-gray-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};


export function Record({ record, onRecordDeleted, onRecordUpdated, syncId, recordType }: RecordProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(record.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete this ${recordType}? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/sync/${syncId}/records?recordId=${record._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to delete record');
      }

      toast.success('Record deleted successfully');
      onRecordDeleted?.(record._id);
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center border-b border-border hover:bg-muted/50 transition-colors">
        <div className="flex-1 px-4 py-3 whitespace-nowrap">
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
            <Badge variant="outline" className="flex items-center gap-1 font-mono text-xs px-2 py-1">
              <Hash className="w-3 h-3 mr-1" />
              {record._id}
            </Badge>
          </div>
        </div>
        <div className="flex-1 px-4 py-3 whitespace-nowrap">
          {record.name || "N/A"}
        </div>
        <div className="flex-1 px-4 py-3 whitespace-nowrap">
          {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "N/A"}
        </div>
        <div className="flex-1 px-4 py-3 whitespace-nowrap">
          {record.updatedAt ? new Date(record.updatedAt).toLocaleDateString() : "N/A"}
        </div>
        <div className="flex-1 px-4 py-3 text-right sticky right-0 bg-background">
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
                <TooltipContent>{copied ? "Copied!" : "Copy JSON"}</TooltipContent>
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
                {recordTypesConfig[recordType as keyof typeof recordTypesConfig]?.allowUpdate && (
                  <DropdownMenuItem
                    onClick={() => setEditDialogOpen(true)}
                    className="flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit {recordType}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? "Deleting..." : `Delete ${recordType}`}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-b border-border">
          <div className="px-4 py-3">
            <div className="space-y-3">
              <pre className="whitespace-pre-wrap break-all bg-gray-100 rounded p-3 text-xs border">
                {JSON.stringify(record.data, null, 2)}
              </pre>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Created:</span>
                  <span>{record.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"}</span>
                  <span>•</span>
                  <span>Updated:</span>
                  <span>{record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "N/A"}</span>
                </div>
                {record.syncError && (
                  <div className="text-red-500">
                    <span className="font-semibold">Sync Error:</span> {record.syncError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <EditRecordDialog
        record={record}
        recordType={recordType}
        syncId={syncId}
        onRecordUpdated={onRecordUpdated}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
} 