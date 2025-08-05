"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// Helper functions
const isArraySchema = (schema: z.ZodTypeAny): boolean => {
  if (schema instanceof z.ZodArray) return true;
  if (schema instanceof z.ZodOptional) {
    return schema.unwrap() instanceof z.ZodArray;
  }
  return false;
};

const getArrayElementSchema = (schema: z.ZodTypeAny): z.ZodTypeAny | null => {
  if (schema instanceof z.ZodArray) {
    return (schema as z.ZodArray<z.ZodTypeAny>).element;
  }
  if (schema instanceof z.ZodOptional) {
    const unwrapped = schema.unwrap();
    if (unwrapped instanceof z.ZodArray) {
      return (unwrapped as z.ZodArray<z.ZodTypeAny>).element;
    }
  }
  return null;
};

const getDefaultValue = (schema: z.ZodTypeAny): unknown => {
  if (schema instanceof z.ZodBoolean) return false;
  if (schema instanceof z.ZodNumber) return 0;
  if (schema instanceof z.ZodDate) return new Date();
  return "";
};

const formatFieldName = (name: string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

// Individual field components
const StringField = ({
  fieldName,
  value,
  error,
  isRequired,
  onChange
}: {
  fieldName: string;
  value: string;
  error?: string;
  isRequired: boolean;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor={fieldName} className="text-sm font-medium">
      {formatFieldName(fieldName)}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Input
      id={fieldName}
      type={fieldName === "email" ? "email" : "text"}
      placeholder={`Enter ${fieldName}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={error ? "border-red-500" : ""}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

const NumberField = ({
  fieldName,
  value,
  error,
  isRequired,
  onChange
}: {
  fieldName: string;
  value: number;
  error?: string;
  isRequired: boolean;
  onChange: (value: number) => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor={fieldName} className="text-sm font-medium">
      {formatFieldName(fieldName)}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Input
      id={fieldName}
      type="number"
      placeholder={`Enter ${fieldName}`}
      value={value || ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className={error ? "border-red-500" : ""}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

const BooleanField = ({
  fieldName,
  value,
  error,
  isRequired,
  onChange
}: {
  fieldName: string;
  value: boolean;
  error?: string;
  isRequired: boolean;
  onChange: (value: boolean) => void;
}) => (
  <div className="flex items-center space-x-2">
    <Checkbox
      id={fieldName}
      checked={value}
      onCheckedChange={(checked) => onChange(checked as boolean)}
    />
    <Label htmlFor={fieldName} className="text-sm font-medium">
      {formatFieldName(fieldName)}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

const DateField = ({
  fieldName,
  value,
  error,
  isRequired,
  onChange
}: {
  fieldName: string;
  value: Date;
  error?: string;
  isRequired: boolean;
  onChange: (value: Date) => void;
}) => {
  const dateValue = value instanceof Date ? value.toISOString().slice(0, 16) : "";

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName} className="text-sm font-medium">
        {formatFieldName(fieldName)}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={fieldName}
        type="datetime-local"
        value={dateValue}
        onChange={(e) => onChange(new Date(e.target.value))}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

const EnumField = ({
  fieldName,
  value,
  error,
  isRequired,
  onChange,
  enumSchema
}: {
  fieldName: string;
  value: string;
  error?: string;
  isRequired: boolean;
  onChange: (value: string) => void;
  enumSchema: z.ZodEnum<[string, ...string[]]>;
}) => (
  <div className="space-y-2">
    <Label htmlFor={fieldName} className="text-sm font-medium">
      {formatFieldName(fieldName)}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={error ? "border-red-500" : ""}>
        <SelectValue placeholder={`Select ${fieldName}`} />
      </SelectTrigger>
      <SelectContent>
        {enumSchema._def.values.map((value: string) => (
          <SelectItem key={value} value={value}>
            {formatFieldName(value)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

const PrimitiveArrayField = ({
  fieldName,
  values,
  error,
  isRequired,
  onChange
}: {
  fieldName: string;
  values: string[];
  error?: string;
  isRequired: boolean;
  onChange: (values: string[]) => void;
}) => {
  const addItem = () => onChange([...values, ""]);
  const removeItem = (index: number) => onChange(values.filter((_, i) => i !== index));
  const updateItem = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName} className="text-sm font-medium">
        {formatFieldName(fieldName)}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="space-y-2">
        {values.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder={`Enter ${fieldName} item ${index + 1}`}
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeItem(index)}
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
          onClick={addItem}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add {fieldName} item
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

const ObjectArrayField = ({
  fieldName,
  values,
  error,
  isRequired,
  onChange,
  objectSchema
}: {
  fieldName: string;
  values: Record<string, unknown>[];
  error?: string;
  isRequired: boolean;
  onChange: (values: Record<string, unknown>[]) => void;
  objectSchema: z.ZodObject<Record<string, z.ZodTypeAny>>;
}) => {
  const objectShape = objectSchema.shape;

  const addItem = () => {
    const newItem = Object.keys(objectShape).reduce((acc, key) => {
      acc[key] = getDefaultValue(objectShape[key]);
      return acc;
    }, {} as Record<string, unknown>);
    onChange([...values, newItem]);
  };

  const removeItem = (index: number) => onChange(values.filter((_, i) => i !== index));

  const updateItem = (index: number, field: string, value: unknown) => {
    const newValues = [...values];
    if (!newValues[index]) newValues[index] = {};
    (newValues[index] as Record<string, unknown>)[field] = value;
    onChange(newValues);
  };

  return (
    <div className="space-y-4">
      <Label htmlFor={fieldName} className="text-sm font-medium">
        {formatFieldName(fieldName)}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="space-y-4">
        {values.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Item {index + 1}</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem(index)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid gap-4">
              {Object.entries(objectShape).map(([objectFieldName, objectFieldSchema]) => {
                const objectFieldValue = (item as Record<string, unknown>)?.[objectFieldName];
                const objectFieldError = error; // Simplified error handling for now
                const isObjectFieldRequired = !objectFieldSchema.isOptional();

                return (
                  <div key={objectFieldName} className="space-y-2">
                    <Label className="text-sm font-medium">
                      {formatFieldName(objectFieldName)}
                      {isObjectFieldRequired && <span className="text-red-500 ml-1">*</span>}
                    </Label>

                    {objectFieldSchema instanceof z.ZodBoolean ? (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={Boolean(objectFieldValue) || false}
                          onCheckedChange={(checked) => updateItem(index, objectFieldName, checked)}
                        />
                        <span className="text-sm">Enable {objectFieldName}</span>
                      </div>
                    ) : objectFieldSchema instanceof z.ZodNumber ? (
                      <Input
                        type="number"
                        placeholder={`Enter ${objectFieldName}`}
                        value={typeof objectFieldValue === 'number' ? objectFieldValue : ""}
                        onChange={(e) => updateItem(index, objectFieldName, Number(e.target.value))}
                        className={objectFieldError ? "border-red-500" : ""}
                      />
                    ) : objectFieldSchema instanceof z.ZodDate ? (
                      <Input
                        type="datetime-local"
                        value={objectFieldValue instanceof Date ? objectFieldValue.toISOString().slice(0, 16) : ""}
                        onChange={(e) => updateItem(index, objectFieldName, new Date(e.target.value))}
                        className={objectFieldError ? "border-red-500" : ""}
                      />
                    ) : objectFieldSchema instanceof z.ZodEnum ? (
                      <Select
                        value={typeof objectFieldValue === 'string' ? objectFieldValue : ""}
                        onValueChange={(value) => updateItem(index, objectFieldName, value)}
                      >
                        <SelectTrigger className={objectFieldError ? "border-red-500" : ""}>
                          <SelectValue placeholder={`Select ${objectFieldName}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {objectFieldSchema._def.values.map((value: string) => (
                            <SelectItem key={value} value={value}>
                              {formatFieldName(value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="text"
                        placeholder={`Enter ${objectFieldName}`}
                        value={typeof objectFieldValue === 'string' ? objectFieldValue : ""}
                        onChange={(e) => updateItem(index, objectFieldName, e.target.value)}
                        className={objectFieldError ? "border-red-500" : ""}
                      />
                    )}

                    {objectFieldError && <p className="text-sm text-red-500">{objectFieldError}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add {fieldName} item
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

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

    // Handle arrays
    if (isArraySchema(fieldSchema)) {
      const arrayValue = Array.isArray(formData[fieldName]) ? formData[fieldName] : [];
      const elementSchema = getArrayElementSchema(fieldSchema);

      if (elementSchema instanceof z.ZodObject) {
        return (
          <ObjectArrayField
            key={fieldName}
            fieldName={fieldName}
            values={arrayValue as Record<string, unknown>[]}
            error={fieldError}
            isRequired={isRequired}
            onChange={(values) => onFieldChange(fieldName, values)}
            objectSchema={elementSchema}
          />
        );
      } else {
        return (
          <PrimitiveArrayField
            key={fieldName}
            fieldName={fieldName}
            values={arrayValue as string[]}
            error={fieldError}
            isRequired={isRequired}
            onChange={(values) => onFieldChange(fieldName, values)}
          />
        );
      }
    }

    // Handle different field types
    if (fieldSchema instanceof z.ZodEnum) {
      return (
        <EnumField
          key={fieldName}
          fieldName={fieldName}
          value={fieldValue as string || ""}
          error={fieldError}
          isRequired={isRequired}
          onChange={(value) => onFieldChange(fieldName, value)}
          enumSchema={fieldSchema}
        />
      );
    }

    if (fieldSchema instanceof z.ZodBoolean) {
      return (
        <BooleanField
          key={fieldName}
          fieldName={fieldName}
          value={fieldValue as boolean || false}
          error={fieldError}
          isRequired={isRequired}
          onChange={(value) => onFieldChange(fieldName, value)}
        />
      );
    }

    if (fieldSchema instanceof z.ZodNumber) {
      return (
        <NumberField
          key={fieldName}
          fieldName={fieldName}
          value={fieldValue as number || 0}
          error={fieldError}
          isRequired={isRequired}
          onChange={(value) => onFieldChange(fieldName, value)}
        />
      );
    }

    if (fieldSchema instanceof z.ZodDate) {
      return (
        <DateField
          key={fieldName}
          fieldName={fieldName}
          value={fieldValue as Date || new Date()}
          error={fieldError}
          isRequired={isRequired}
          onChange={(value) => onFieldChange(fieldName, value)}
        />
      );
    }

    // Default to string field
    return (
      <StringField
        key={fieldName}
        fieldName={fieldName}
        value={fieldValue as string || ""}
        error={fieldError}
        isRequired={isRequired}
        onChange={(value) => onFieldChange(fieldName, value)}
      />
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