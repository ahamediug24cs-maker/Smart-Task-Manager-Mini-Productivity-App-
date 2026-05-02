import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
