import "server-only";

import mongoose, { Schema, Model } from "mongoose";
import { ISync, SyncStatusObject } from "./types";

const SyncSchema: Schema = new Schema(
  {
    instanceKey: { type: String, required: true },
    status: {
      type: String,
      enum: [
        SyncStatusObject.IN_PROGRESS,
        SyncStatusObject.COMPLETED,
        SyncStatusObject.FAILED,
      ],
      default: SyncStatusObject.IN_PROGRESS,
      required: true,
    },
    userId: { type: String, required: true },
    appObjectKey: { type: String, required: true },
    pullError: { type: String, required: false },
    pullCount: { type: Number, required: false, default: 0 },
    integrationKey: { type: String, required: true },
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

    await Promise.all([
      Record.deleteMany({ syncId: sync._id.toString() }),
      SyncActivity.deleteMany({ syncId: sync._id.toString() }),
    ]);

    next();
  }
);

export const Sync: Model<ISync> =
  mongoose.models.Sync || mongoose.model<ISync>("Sync", SyncSchema);
