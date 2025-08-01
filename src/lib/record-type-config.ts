import { z } from "zod";
import { RecordType } from "@/models/types";
import { getPluralForm } from "./pluralize-utils";

/**
 * Define the schema for each record type
 */
const emailSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  to: z.array(z.string()),
  cc: z.array(z.string()),
  bcc: z.array(z.string()),
  from: z.string(),
  replyTo: z.array(z.string()),
  subject: z.string(),
  body: z.string(),
  htmlBody: z.string(),
  attachments: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      name: z.string(),
      content: z.string(),
      url: z.string(),
    })
  ),
});

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
});

const fileSchema = z.object({
  id: z.string(),
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
  }
> = {
  email: {
    schema: emailSchema,
    allowDelete: true,
    allowUpdate: false,
    allowCreate: true,
  },
  user: {
    schema: userSchema,
    allowDelete: true,
    allowUpdate: true,
    allowCreate: true,
  },
  file: {
    schema: fileSchema,
    allowDelete: true,
    allowUpdate: true,
    allowCreate: true,
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
