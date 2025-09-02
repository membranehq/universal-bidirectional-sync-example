"use client";

import { memo, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { IRecord, RecordType } from "@/models/types";
import { capitalize } from "@/lib/string-utils";
import { getPluralForm } from "@/lib/pluralize-utils";
import recordTypesConfig from "@/lib/app-objects";
import { Record } from "./Record";
import { CreateRecordModal } from "../CreateRecordModal";
import { EditRecordDialog } from "../EditRecordDialog";


/**
 * Props interface for the Records component
 * 
 * @interface RecordsProps
 * @description Defines the properties required for rendering and managing a list of records
 * with pagination, loading states, and CRUD operations
 */
interface RecordsProps {
  /** Array of record objects to be displayed in the list */
  records: IRecord[];

  /** The type of records being displayed (e.g., 'user', 'email', 'file') */
  recordType: RecordType;

  /** Flag indicating if the records are currently being loaded */
  isLoading: boolean;

  /** 
  * Callback function to handle record deletion
  * @param recordId - The unique identifier of the record to delete
  * @returns Promise that resolves when deletion is complete
  */
  onDeleteRecord: (recordId: string) => Promise<void>;

  /**
   * Callback function to handle record creation
   * @param recordData - Object containing the data for the new record
   * @returns Promise that resolves when creation is complete
   */
  onCreateRecord: (recordData: Record<string, unknown>) => Promise<void>;

  /**
   * Callback function to handle record updates
   * @param recordId - The unique identifier of the record to update
   * @param recordData - Object containing the updated data for the record
   * @returns Promise that resolves when update is complete
   */
  onUpdateRecord: (recordId: string, recordData: Record<string, unknown>) => Promise<void>;

  /** Optional function to render custom content on the right side of each record */
  renderRight?: (record: IRecord) => React.ReactNode;

  /** Optional function to render custom content in the header area */
  renderHeader?: () => React.ReactNode;
}



export const Records = memo(function Records({
  records,
  recordType,
  isLoading,
  onDeleteRecord,
  onCreateRecord,
  onUpdateRecord,
  renderRight,
  renderHeader,
}: RecordsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IRecord | null>(null);

  const handleEditRecord = useCallback((record: IRecord) => {
    setEditingRecord(record);
    setEditDialogOpen(true);
  }, []);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {capitalize(getPluralForm(recordType))}
          </h2>
          {recordTypesConfig[recordType as keyof typeof recordTypesConfig]?.allowCreate && (
            <CreateRecordModal
              recordType={recordType}
              onCreatedRecord={onCreateRecord}
            />
          )}
        </div>
        <div className="border rounded-lg overflow-hidden">
          {renderHeader && (
            <div className="bg-gray-50 p-3 text-sm text-gray-700 pl-6 border-b">
              {renderHeader()}
            </div>
          )}
          <div>
            {isLoading ? (
              // Show skeleton records when loading
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="border-b last:border-b-0">
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Show actual records when not loading
              records.map(
                (record, idx: number) => (
                  <Record
                    key={record._id}
                    record={record}
                    index={idx}
                    onRecordDeleted={onDeleteRecord}
                    onEditRecord={handleEditRecord}
                    recordType={recordType}
                    renderRight={renderRight ? renderRight(record) : null}
                  />
                )
              )
            )}
          </div>
        </div>
      </div>

      {editingRecord && (
        <EditRecordDialog
          recordType={recordType}
          record={editingRecord}
          onUpdateRecord={onUpdateRecord}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  );
}); 