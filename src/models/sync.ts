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
    collectionEventDetails: { type: Schema.Types.Mixed, required: false },
    syncCount: { type: Number, required: false, default: 0 },
  },
  { timestamps: true }
);

export const Sync: Model<ISync> =
  mongoose.models.Sync || mongoose.model<ISync>("Sync", SyncSchema);
