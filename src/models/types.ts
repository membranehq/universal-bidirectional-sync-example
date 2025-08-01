import { ExternalEventSubscription } from "@integration-app/sdk";

export interface IRecord {
  _id: string;
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  data: Record<string, unknown>;
  syncId: string;
}

export type SyncStatus = "pending" | "in_progress" | "completed" | "failed";

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
  error?: string;
  syncCount: number;
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
  | "event_record_created"
  | "event_record_updated"
  | "event_record_deleted";

export interface ISyncActivity {
  _id: string;
  syncId: string;
  userId: string;
  type: SyncActivityType;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

type EventType = "created" | "updated" | "deleted";

export type Subscriptions = {
  [K in `data-record-${EventType}`]: ExternalEventSubscription | null;
};
