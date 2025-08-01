"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Loader2 } from "lucide-react";
import recordTypesConfig from "@/lib/record-type-config";
import { ZodFormRenderer } from "./ZodFormRenderer";
import { z } from "zod";
import { toast } from "sonner";
import type { IRecord } from "@/models/types";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { useAuth } from "@clerk/nextjs";

interface EditRecordModalProps {
  record: IRecord;
  recordType: string;
  syncId: string;
  trigger?: React.ReactNode;
  onRecordUpdated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditRecordModal({
  record,
  recordType,
  syncId,
  trigger,
  onRecordUpdated,
  open,
  onOpenChange,
}: EditRecordModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();


  console.log("record", record);

  const config = recordTypesConfig[recordType as keyof typeof recordTypesConfig];

  // Initialize form data with existing record data when modal opens
  useEffect(() => {
    if (isOpen && record.data) {
      setFormData(record.data);
    }
  }, [isOpen, record.data]);

  if (!config || !config.allowUpdate) {
    return null;
  }

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      // Validate the form data against the schema
      const validatedData = config.schema.parse(formData);
      console.log("Validated data:", validatedData);

      // Submit the data to the API
      await fetchWithAuth(`/api/sync/${syncId}/records/${record._id}`, getToken, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      toast.success('Record updated successfully');
      onRecordUpdated?.();
      setIsOpen(false);
      setFormData({});
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path.join(".");
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Failed to update record:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to update record');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setFormData({});
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit {recordType}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 border-b px-6 py-4">
          <DialogTitle>Edit {recordType}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 p-3">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ZodFormRenderer
              schema={config.schema}
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
            />
          </div>
          <div className="flex justify-end gap-2 px-6 py-4 border-t bg-background flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                `Update ${recordType}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 