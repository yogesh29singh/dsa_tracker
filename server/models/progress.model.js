import mongoose, { Schema } from "mongoose";

const UserProgressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    problem: { type: Schema.Types.ObjectId, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

UserProgressSchema.index({ user: 1, topic: 1 });

export const UserProgress = mongoose.model("UserProgress", UserProgressSchema);