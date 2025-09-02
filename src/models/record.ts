import "server-only";

import mongoose, { Schema, Model } from "mongoose";
import { IRecord, SyncStatusObject } from "./types";

const RecordSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: false },
    syncId: { type: String, required: true },
    externalId: { type: String, required: false },

    syncStatus: {
      type: String,
      required: true,
      default: SyncStatusObject.PENDING,
      enum: Object.values(SyncStatusObject),
    },
    syncError: { type: String, required: false },

    name: { type: String, required: false },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Record: Model<IRecord> =
  mongoose.models.Record || mongoose.model<IRecord>("Record", RecordSchema);
