import "server-only";

import mongoose, { Schema, Model } from "mongoose";
import { IRecord } from "./types";

const RecordSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: false },
    syncId: { type: String, required: true },
    externalId: { type: String, required: false },

    /**
     * Derived from the record UDM
     */
    name: { type: String, required: false },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Record: Model<IRecord> =
  mongoose.models.Record || mongoose.model<IRecord>("Record", RecordSchema);
