"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { z } from "zod";

interface ZodFormRendererProps {
  schema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  formData: Record<string, unknown>;
  errors: Record<string, string>;
  onFieldChange: (field: string, value: unknown) => void;
}

export function ZodFormRenderer({
  schema,
  formData,
  errors,
  onFieldChange,
}: ZodFormRendererProps) {
  const shape = schema.shape;

  const renderField = (fieldName: string, fieldSchema: z.ZodTypeAny) => {
    const isRequired = !fieldSchema.isOptional();
    const fieldValue = formData[fieldName];
    const fieldError = errors[fieldName];

    if (fieldSchema instanceof z.ZodArray) {
      // Handle array fields with individual input fields
      const arrayValue = Array.isArray(formData[fieldName]) ? formData[fieldName] as string[] : [];

      const addArrayItem = () => {
        const newArray = [...arrayValue, ""];
        onFieldChange(fieldName, newArray);
      };

      const removeArrayItem = (index: number) => {
        const newArray = arrayValue.filter((_, i) => i !== index);
        onFieldChange(fieldName, newArray);
      };

      const updateArrayItem = (index: number, value: string) => {
        const newArray = [...arrayValue];
        newArray[index] = value;
        onFieldChange(fieldName, newArray);
      };

      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName} className="text-sm font-medium">
            {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="space-y-2">
            {arrayValue.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Enter ${fieldName} item ${index + 1}`}
                  value={item}
                  onChange={(e) => updateArrayItem(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem(index)}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addArrayItem}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {fieldName} item
            </Button>
          </div>
          {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
        </div>
      );
    }

    if (fieldSchema instanceof z.ZodEnum) {
      // Handle enum fields (like status in user)
      const enumValue = (fieldValue as string) || "";
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName} className="text-sm font-medium">
            {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select value={enumValue} onValueChange={(value) => onFieldChange(fieldName, value)}>
            <SelectTrigger className={fieldError ? "border-red-500" : ""}>
              <SelectValue placeholder={`Select ${fieldName}`} />
            </SelectTrigger>
            <SelectContent>
              {fieldSchema._def.values.map((value: string) => (
                <SelectItem key={value} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
        </div>
      );
    }

    if (fieldSchema instanceof z.ZodBoolean) {
      // Handle boolean fields
      return (
        <div key={fieldName} className="flex items-center space-x-2">
          <Checkbox
            id={fieldName}
            checked={formData[fieldName] as boolean}
            onCheckedChange={(checked) => onFieldChange(fieldName, checked)}
          />
          <Label htmlFor={fieldName} className="text-sm font-medium">
            {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
        </div>
      );
    }

    if (fieldSchema instanceof z.ZodNumber) {
      // Handle number fields
      const numberValue = (fieldValue as number) || "";
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName} className="text-sm font-medium">
            {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={fieldName}
            type="number"
            placeholder={`Enter ${fieldName}`}
            value={numberValue}
            onChange={(e) => onFieldChange(fieldName, Number(e.target.value))}
            className={fieldError ? "border-red-500" : ""}
          />
          {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
        </div>
      );
    }

    if (fieldSchema instanceof z.ZodDate) {
      // Handle date fields
      let dateValue = '';
      if (fieldValue && typeof fieldValue === 'object' && 'toISOString' in fieldValue) {
        dateValue = (fieldValue as Date).toISOString().slice(0, 16);
      } else if (typeof fieldValue === 'string') {
        try {
          dateValue = new Date(fieldValue).toISOString().slice(0, 16);
        } catch {
          dateValue = '';
        }
      }

      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName} className="text-sm font-medium">
            {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={fieldName}
            type="datetime-local"
            value={dateValue}
            onChange={(e) => onFieldChange(fieldName, new Date(e.target.value))}
            className={fieldError ? "border-red-500" : ""}
          />
          {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
        </div>
      );
    }

    // Default to text input for string fields
    const isTextArea = fieldName === "body" || fieldName === "htmlBody" || fieldName === "content";
    const stringValue = (fieldValue as string) || "";

    if (isTextArea) {
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName} className="text-sm font-medium">
            {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id={fieldName}
            placeholder={`Enter ${fieldName}`}
            value={stringValue}
            onChange={(e) => onFieldChange(fieldName, e.target.value)}
            className={fieldError ? "border-red-500" : ""}
            rows={4}
          />
          {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
        </div>
      );
    }

    return (
      <div key={fieldName} className="space-y-2">
        <Label htmlFor={fieldName} className="text-sm font-medium">
          {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={fieldName}
          type={fieldName === "email" ? "email" : "text"}
          placeholder={`Enter ${fieldName}`}
          value={stringValue}
          onChange={(e) => onFieldChange(fieldName, e.target.value)}
          className={fieldError ? "border-red-500" : ""}
        />
        {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
      </div>
    );
  };

  return (
    <div className="grid gap-4">
      {Object.entries(shape).map(([fieldName, fieldSchema]) =>
        renderField(fieldName, fieldSchema as z.ZodTypeAny)
      )}
    </div>
  );
} 