import { ExternalEventSubscription } from "@integration-app/sdk";

export const SyncStatusObject = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type SyncStatus =
  (typeof SyncStatusObject)[keyof typeof SyncStatusObject];

export interface IRecord {
  _id: string;
  externalId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  data: Record<string, unknown>;
  syncId: string;
  syncStatus: SyncStatus;
  syncError?: string;
}

export type RecordType = "email" | "file" | "user";

export interface ISync {
  _id: string;
  integrationKey: string;
  instanceKey: string;
  status: SyncStatus;
  userId: string;
  recordType: RecordType;
  createdAt: Date;
  updatedAt: Date;
  pullError?: string;
  pullCount: number;
  integrationName: string;
  integrationLogoUri: string;
  recordCount?: number;
}

export interface IUser {
  _id: string;
  authUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SyncActivityType =
  | "sync_created"
  | "sync_syncing"
  | "sync_completed"
  | "sync_resync_triggered"
  | "sync_pulling"
  | "sync_pull_completed"
  | "sync_pull_failed"
  | "event_record_created"
  | "event_record_updated"
  | "event_record_deleted";

export interface ISyncActivity {
  _id: string;
  syncId: string;
  userId: string;
  type: SyncActivityType;
  metadata?: SyncActivityMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncActivityMetadata {
  recordId?: string;
  totalDocumentsSynced?: number;
  fieldsCount?: number;
  error?: string;
  differences?: Record<string, unknown>;
  [key: string]: unknown;
}

type EventType = "created" | "updated" | "deleted";

export type Subscriptions = {
  [K in `data-record-${EventType}`]: ExternalEventSubscription | null;
};
