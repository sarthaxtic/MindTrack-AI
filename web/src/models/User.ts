import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    apiKey: { type: String, unique: true, sparse: true },
    notificationPrefs: {
      high_risk: { type: Boolean, default: true },
      weekly_digest: { type: Boolean, default: true },
      model_updates: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const User = models.User || mongoose.model("User", UserSchema);