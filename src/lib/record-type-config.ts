import { z } from "zod";
import { RecordType, IRecord } from "@/models/types";
import { Mail, User, File } from "lucide-react";
import {
  EmailRecord,
  UserRecord,
  FileRecord,
} from "@/app/sync/[id]/components/record-types";

/**
 * Define the schema for each record type
 */
export const emailSchema = z.object({
  subject: z.string(),
  to: z.array(z.string()),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
  from: z.string().optional(),
  replyTo: z.string().optional(),
  threadId: z.string().optional(),
  body: z.string().optional(),
  htmlBody: z.string().optional(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        name: z.string(),
        content: z.string(),
        url: z.string(),
      })
    )
    .optional(),
});

export const userSchema = z.object({
  fullName: z.string(),
  imageUrl: z.string().optional(),
});

export const fileSchema = z.object({
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
    component?: React.ComponentType<{ record: IRecord }>;
  }
> = {
  email: {
    schema: emailSchema,
    allowDelete: true,
    allowUpdate: false,
    allowCreate: true,
    icon: Mail,
    component: EmailRecord,
  },
  user: {
    schema: userSchema,
    allowDelete: true,
    allowUpdate: true,
    allowCreate: true,
    icon: User,
    component: UserRecord,
  },
  file: {
    schema: fileSchema,
    allowDelete: true,
    allowUpdate: true,
    allowCreate: true,
    icon: File,
    component: FileRecord,
  },
};

export default recordTypesConfig;
