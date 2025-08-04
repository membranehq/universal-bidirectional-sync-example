import { z } from "zod";
import { RecordType } from "@/models/types";
import { getPluralForm } from "./pluralize-utils";
import { Mail, User, File } from "lucide-react";

/**
 * Define the schema for each record type
 */
const emailSchema = z.object({
  subject: z.string(),
  to: z.array(z.string()),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
  from: z.string().optional(),
  replyTo: z.array(z.string()).optional(),
  threadId: z.string().optional(),
  body: z.string().optional(),
  htmlBody: z.string().optional(),
  attachments: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      name: z.string(),
      content: z.string(),
      url: z.string(),
    })
  ).optional(),
})

const userSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
});

const fileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string(),
  path: z.string().optional(),
  parentId: z.string().optional(),
  isFolder: z.boolean().optional(),
  lastModified: z.date().optional(),
});

const recordTypesConfig: Record<
  RecordType,
  {
    schema: z.ZodObject<z.ZodRawShape>;
    allowDelete: boolean;
    allowUpdate: boolean;
    allowCreate: boolean;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  email: {
    schema: emailSchema,
    allowDelete: true,
    allowUpdate: true,
    allowCreate: true,
    icon: Mail,
  },
  user: {
    schema: userSchema,
    allowDelete: true,
    allowUpdate: true,
    allowCreate: true,
    icon: User,
  },
  file: {
    schema: fileSchema,
    allowDelete: true,
    allowUpdate: true,
    allowCreate: true,
    icon: File,
  },
};

/**
 * Construct the key of an element based on some standard naming convention
 *
 * All elements on membrane should follow this naming convention.
 */
export const getElementKey = (
  recordType: string,
  elementType:
    | "list-action"
    | "create-action"
    | "update-action"
    | "delete-action"
    | "field-mapping"
    | "data-source"
    | "flow"
) => {
  const pluralizedRecordType = getPluralForm(recordType);

  switch (elementType) {
    case "list-action":
      return `get-${pluralizedRecordType}`;
    case "create-action":
      return `create-${recordType}`;
    case "update-action":
      return `update-${recordType}`;
    case "delete-action":
      return `delete-${recordType}`;
    case "field-mapping":
      return `${pluralizedRecordType}`;
    case "data-source":
      return `${pluralizedRecordType}`;
    case "flow":
      return `receive-${recordType}-events`;
  }
};

export default recordTypesConfig;
