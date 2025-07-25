export interface IRecord {
  _id: string;
  /**
   * Id of the record from the integration
   */
  id: string;
  userId: string;
  data: Record<string, unknown>;
  syncId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SyncStatus = "pending" | "in_progress" | "completed" | "failed";

export interface ISync {
  _id: string;
  integrationKey: string;
  instanceKey: string;
  status: SyncStatus;
  userId: string;
  dataSourceKey: string;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
  collectionEventDetails: Record<string, unknown>;
  syncCount: number;
}

export interface IUser {
  _id: string;
  authUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
