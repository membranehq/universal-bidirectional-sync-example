import "server-only";

import mongoose, { Schema, Model } from "mongoose";
import { IRecord } from "./types";

const RecordSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: false },
    syncId: { type: String, required: true },
    id: { type: String, required: true },
  },
  { timestamps: true }
);

export const Record: Model<IRecord> =
  mongoose.models.Record || mongoose.model<IRecord>("Record", RecordSchema);
