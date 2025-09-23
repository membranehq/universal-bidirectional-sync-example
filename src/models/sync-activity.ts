import "server-only";

import mongoose, { Schema, Model } from "mongoose";
import { ISyncActivity } from "./types";

const SyncActivitySchema: Schema = new Schema(
  {
    syncId: { type: String, required: true },
    userId: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "sync_pull_failed",
        "sync_syncing",
        "sync_completed",
        "sync_resync_triggered",
        "event_record_created",
        "event_record_updated",
        "event_record_deleted",
      ],
      required: true,
    },
    recordId: { type: String, required: false },
    metadata: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: true }
);

SyncActivitySchema.index({ syncId: 1, createdAt: -1 });
SyncActivitySchema.index({ userId: 1, syncId: 1 });
SyncActivitySchema.index({ type: 1, createdAt: -1 });

export const SyncActivity: Model<ISyncActivity> =
  mongoose.models.SyncActivity ||
  mongoose.model<ISyncActivity>("SyncActivity", SyncActivitySchema);
