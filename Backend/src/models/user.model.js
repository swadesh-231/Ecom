import mongoose, { Schema } from "mongoose";

// Authentication is handled entirely by Clerk. We mirror the Clerk user here so
// we can attach app-specific data (role, orders, reviews) and query by it.
// No passwords or tokens are stored locally.
const userSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
