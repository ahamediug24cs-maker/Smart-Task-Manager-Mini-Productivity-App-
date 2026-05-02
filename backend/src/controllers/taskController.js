import { Task } from "../models/Task.js";

const validStatuses = new Set(["todo", "in-progress", "done"]);

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ updatedAt: -1 });
    return res.json({ tasks });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks.", error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, notes = "", status = "todo" } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }

    if (!validStatuses.has(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const task = await Task.create({
      user: req.userId,
      title: title.trim(),
      notes: notes.trim(),
      status,
    });

    return res.status(201).json({ task });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create task.", error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, notes, status } = req.body;

    const task = await Task.findOne({ _id: id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (typeof title === "string") {
      if (!title.trim()) {
        return res.status(400).json({ message: "Title cannot be empty." });
      }
      task.title = title.trim();
    }
    if (typeof notes === "string") {
      task.notes = notes.trim();
    }
    if (typeof status === "string") {
      if (!validStatuses.has(status)) {
        return res.status(400).json({ message: "Invalid status value." });
      }
      task.status = status;
    }

    await task.save();
    return res.json({ task });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update task.", error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.json({ message: "Task deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete task.", error: error.message });
  }
};
