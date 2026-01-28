import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ENDPOINTS } from "../config.js";

export function TaskDialog({ isOpen, onClose, task }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState([]);
  const isEditing = !!task;

  useEffect(() => {
    if (isOpen) {
      const fetchGoals = async () => {
        setIsLoading(true);
        try {
          const token = await localStorage("accessToken");
          if (!token) {
            return;
          }
          const response = await fetch(ENDPOINTS.GOALS.BASE, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setGoals(response.data);

          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      };
      fetchGoals();
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "Incomplete");
      setPriority(task.priority || "medium");
      setDueDate(
        task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : "",
      );
      setCategory(task.category || "");
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted"); // Debugging
    setIsLoading(true);
    if (!title.trim()) {
      setError("Title is required.");
      setIsLoading(false);
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      setIsLoading(false);
      return;
    }
    if (!category.trim()) {
      setError("Category is required.");
      setIsLoading(false);
      return;
    }

    const taskData = {
      title,
      description,
      status,
      priority,
      due_date: dueDate,
      category,
    };

    try {
      console.log("Token:", localStorage.getItem("token"));

      if (isEditing) {
        await axios.put(`/tasks/${task._id}`, taskData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        await axios.post("/tasks", taskData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }
      onClose();
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      setError(
        error.response?.data?.message ||
          "An error occurred while saving the task.",
      );
      console.error(
        "Error saving task:",
        error.response?.data || error.message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-slate-900 shadow-xl border dark:border-slate-800">
        <form onSubmit={handleSubmit}>
          {/* Dialog Header */}
          <div className="border-b dark:border-slate-800 p-4">
            <h2 className="text-lg font-semibold dark:text-white">
              {isEditing ? "Edit Task" : "Create New Task"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditing
                ? "Make changes to the task here."
                : "Add the details for your new task."}
            </p>
          </div>

          {/* Dialog Body */}
          <div className="p-4 space-y-4">
            {/* Title */}
            <InputField
              label="Title"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Description */}
            <InputField
              label="Description"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              type="textarea"
            />

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Status"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: "todo", label: "To Do" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                ]}
              />
              <SelectField
                label="Priority"
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
              />
            </div>

            {/* Due Date and Category */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Due Date"
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <SelectField
                label="Category"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={goals.map((goal) => ({
                  value: goal.title,
                  label: goal.title,
                }))}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="text-sm text-red-500 p-4">{error}</div>}

          {/* Dialog Footer */}
          <div className="border-t p-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isLoading
                ? "Processing..."
                : isEditing
                  ? "Save Changes"
                  : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable input and selcet field components updated for dark mode
const InputField = ({
  label,
  id,
  value,
  onChange,
  type = "text",
  required = false,
}) => (
  <div className="space-y-1">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md outline-none focus:ring-2 focus:ring-blue-500"
      />
    ) : (
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md outline-none focus:ring-2 focus:ring-blue-500"
      />
    )}
  </div>
);

const SelectField = ({ label, id, value, onChange, options }) => (
  <div className="space-y-1">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);
