"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import recordTypesConfig from "@/lib/app-objects";
import { ZodFormRenderer } from "./ZodFormRenderer";
import { z } from "zod";

interface CreateRecordModalProps {
  recordType: string;
  trigger?: React.ReactNode;
  onCreatedRecord?: (recordData: Record<string, unknown>) => Promise<void>;
}

export function CreateRecordModal({
  recordType,
  trigger,
  onCreatedRecord,
}: CreateRecordModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = recordTypesConfig[recordType as keyof typeof recordTypesConfig];
  const IconComponent = config?.icon;

  if (!config) {
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

    console.log("Form data:", formData);

    try {
      setIsSubmitting(true);
      // Validate the form data against the schema
      const validatedData = config.schema.parse(formData);
      console.log("Validated data:", validatedData);

      // Call the callback if provided
      if (onCreatedRecord) {
        await onCreatedRecord(validatedData);
      }

      // Close modal and reset form
      setIsOpen(false);
      setFormData({});
      setErrors({});
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Failed to create record' });
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
          <Button size="sm" className="flex items-center gap-2">
            Create {recordType}
            {IconComponent ? <IconComponent className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 border-b px-6 py-4">
          <DialogTitle>Create {recordType}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 p-3">
          {errors.form && (
            <div className="px-6 py-3 bg-red-50 border border-red-200 rounded-md mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.form}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ZodFormRenderer
              schema={config.schema as z.ZodObject<Record<string, z.ZodTypeAny>>}
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
              type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : `Create ${recordType}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 