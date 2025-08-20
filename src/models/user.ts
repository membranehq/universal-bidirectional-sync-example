import "server-only";

import mongoose from "mongoose";
import { IUser } from "./types";

const userSchema = new mongoose.Schema<IUser>(
  {
    authUserId: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
