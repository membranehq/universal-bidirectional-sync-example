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
} from "lucide-react";
import type { IRecord } from "@/models/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import appObjects from "@/lib/app-objects";
import { getPluralForm, getSingularForm } from '@/lib/pluralize-utils';

interface RecordProps {
  record: IRecord;
  index: number;
  onRecordDeleted?: (recordId: string) => Promise<void>;
  onEditRecord?: (record: IRecord) => void;
  recordType: string;
  renderRight?: React.ReactNode;
}

export function Record({
  record,
  onRecordDeleted,
  onEditRecord,
  recordType,
  renderRight,
}: RecordProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(record.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onRecordDeleted?.(record._id);
      toast.success(`${recordType} deleted successfully`);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast.error(
        error instanceof Error ? error.message : `Failed to delete ${recordType}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    onEditRecord?.(record);
  };

  const renderAppObject = () => {
    const appObject =
      appObjects[getPluralForm(recordType) as keyof typeof appObjects];
    const RecordComponent = appObject?.component;

    if (RecordComponent) {
      return <RecordComponent record={record as unknown as IRecord} />;
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

        {renderAppObject()}

        <div className="px-4 py-3 text-right sticky right-0 bg-background">
          <div className="flex items-center justify-end gap-1">
            <div className="flex items-center gap-2 mr-2">
              {renderRight}
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
                {appObjects[recordType as keyof typeof appObjects]
                  ?.allowUpdate && (
                    <DropdownMenuItem
                      onClick={handleEdit}
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit {getSingularForm(recordType)}
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
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete ${recordType}`}
        description={`Are you sure you want to delete this ${recordType}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
