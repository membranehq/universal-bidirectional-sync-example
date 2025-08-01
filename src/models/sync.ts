import "server-only";

import mongoose, { Schema, Model } from "mongoose";
import { ISync } from "./types";

const SyncSchema: Schema = new Schema(
  {
    integrationKey: { type: String, required: true },
    instanceKey: { type: String, required: true },
    status: {
      type: String,
      enum: ["in_progress", "completed", "failed"],
      default: "in_progress",
      required: true,
    },
    userId: { type: String, required: true },
    dataSourceKey: { type: String, required: true },
    error: { type: String, required: false },
    syncCount: { type: Number, required: false, default: 0 },
    integrationName: { type: String, required: false },
    integrationLogoUri: { type: String, required: false },
  },
  { timestamps: true }
);

// Pre-delete middleware to cascade delete related records and activities
SyncSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const sync = this as mongoose.Document & { _id: mongoose.Types.ObjectId };
    const { Record } = await import("./record");
    const { SyncActivity } = await import("./sync-activity");

    // Delete all related records and activities
    await Promise.all([
      Record.deleteMany({ syncId: sync._id.toString() }),
      SyncActivity.deleteMany({ syncId: sync._id.toString() }),
    ]);

    next();
  }
);

export const Sync: Model<ISync> =
  mongoose.models.Sync || mongoose.model<ISync>("Sync", SyncSchema);
