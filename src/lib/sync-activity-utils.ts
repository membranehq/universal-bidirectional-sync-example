import "server-only";
import { SyncActivity } from "@/models/sync-activity";
import { SyncActivityType, SyncActivityMetadata } from "@/models/types";

interface CreateSyncActivityParams {
  syncId: string;
  userId: string;
  type: SyncActivityType;
  recordId?: string;
  metadata?: SyncActivityMetadata;
}

export async function createSyncActivity({
  syncId,
  userId,
  type,
  recordId,
  metadata,
}: CreateSyncActivityParams) {
  try {
    await SyncActivity.create({
      syncId,
      userId,
      type,
      recordId,
      metadata,
    });
  } catch (error) {
    console.error("Failed to create sync activity:", error);
    // Don't throw error to avoid breaking the main flow
  }
}

export async function getSyncActivities(syncId: string, limit = 50) {
  try {
    return await SyncActivity.find({ syncId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error("Failed to get sync activities:", error);
    return [];
  }
}
