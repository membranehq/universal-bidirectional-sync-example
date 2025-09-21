"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import appObjects from "@/lib/app-objects";
import { getSingularForm } from "@/lib/pluralize-utils";
import { z } from "zod";
import { IRecord } from "@/models/types";
import { ZodFormRenderer } from "./ZodFormRenderer";

interface EditRecordModalProps {
  record: IRecord;
  appObjectKey: string;
  onUpdateRecord?: (recordId: string, recordData: Record<string, unknown>) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditRecordDialog({
  record,
  appObjectKey,
  onUpdateRecord,
  open,
  onOpenChange,
}: EditRecordModalProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => record.data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config =
    appObjects[appObjectKey as keyof typeof appObjects];

  const editSchema = (config.schema as z.ZodObject<Record<string, z.ZodTypeAny>>).omit({ id: true });

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      if (onUpdateRecord) {
        await onUpdateRecord(record._id, formData);
      }
      onOpenChange?.(false);
      setFormData({});
      setErrors({});
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Failed to update record' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange?.(false);
    setFormData({});
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] sm:max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 border-b px-4 sm:px-6 py-3 sm:py-4">
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
            <config.icon className="w-5 h-5 text-gray-500" />
            Edit {getSingularForm(config.label)}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 p-2 sm:p-3"
        >
          {errors.form && (
            <div className="px-4 sm:px-6 py-3 bg-red-50 border border-red-200 rounded-md mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm text-red-800">{errors.form}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
            <ZodFormRenderer
              schema={editSchema}
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
            />
          </div>
          <div className="flex justify-end gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t bg-background flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1 sm:mr-2" />
                  Updating...
                </>
              ) : (
                `Update ${config.label}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
