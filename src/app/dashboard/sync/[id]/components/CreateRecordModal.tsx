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
import recordTypesConfig from "@/lib/record-type-config";
import { ZodFormRenderer } from "./ZodFormRenderer";
import { z } from "zod";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { useAuth } from "@clerk/nextjs";

interface CreateRecordModalProps {
  recordType: string;
  syncId: string;
  trigger?: React.ReactNode;
}

export function CreateRecordModal({
  recordType,
  syncId,
  trigger,
}: CreateRecordModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();

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

      // Submit the data to the API
      const response = await fetchWithAuth(
        `/api/sync/${syncId}/records`,
        getToken,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: validatedData }),
        }
      );

      console.log("Record created:", response);

      // Close modal and reset form
      setIsOpen(false);
      setFormData({});
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          const field = err.path.join(".");
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error("Failed to create record:", error);
        // You might want to show a toast notification here
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