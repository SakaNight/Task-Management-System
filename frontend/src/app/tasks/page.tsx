"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// 定义任务类型
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  attachment?: string;
}

const statusOptions = ["todo", "in_progress", "stuck", "done"];

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedStatus, setEditedStatus] = useState("todo");
  const [filter, setFilter] = useState("all");

  const filteredTasks = tasks.filter((task) =>
    filter === "all" ? true : task.status === filter
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    api.interceptors.request.use((config) => {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    fetchTasks();
  }, [router]);

  const fetchTasks = async () => {
    try {
      const res = await api.get<Task[]>("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/tasks", { title, description, status });
      setTitle("");
      setDescription("");
      setStatus("todo");
      fetchTasks();
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const handleFileUpload = async (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/tasks/${taskId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchTasks();
    } catch (err) {
      alert("Failed to upload file");
    }
  };

  const handleDeleteAttachment = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}/attachment`);
      fetchTasks();
    } catch (err) {
      alert("Failed to delete attachment");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${taskId}`, {
        title: editedTitle,
        description: editedDescription,
        status: editedStatus,
      });
      setEditingTaskId(null);
      fetchTasks();
    } catch (err) {
      alert("Failed to update task");
    }
  };

  return (
    <main className="max-w-5xl mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Tasks</h1>
        <div className="space-x-4">
          <button
            onClick={() => router.push("/tasks/stats")}
            className="text-sm text-violet-500 hover:underline"
          >
            View Stats
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      <form
        onSubmit={handleCreateTask}
        className="bg-neutral-900/80 p-6 rounded-xl border border-neutral-800 space-y-4"
      >
        <h2 className="text-xl font-semibold">Create New Task</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-md"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-md"
          required
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-md"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="flex justify-end">
          <button className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700">
            Add Task
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Filter Tasks</h2>
        <select
          className="p-2 bg-zinc-800 text-white border border-zinc-700 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : filteredTasks.length === 0 ? (
          <p className="text-gray-400">No tasks found.</p>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-800"
            >
              {editingTaskId === task.id ? (
                <form
                  onSubmit={(e) => handleSaveEdit(e, task.id)}
                  className="space-y-2"
                >
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-md"
                  />
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-md"
                  />
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-md"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTaskId(null)}
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <p className="text-gray-400">{task.description}</p>
                </>
              )}

              <div className="flex gap-2 mt-2 items-center">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="p-2 bg-zinc-800 text-white border border-zinc-700 rounded"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setEditingTaskId(task.id);
                    setEditedTitle(task.title);
                    setEditedDescription(task.description);
                    setEditedStatus(task.status);
                  }}
                  className="text-sm text-violet-500 hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="mt-2">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(task.id, file);
                  }}
                />
              </div>

              {task.attachment && (
                <div className="mt-2 flex gap-2 items-center">
                  <a
                    href={`http://localhost:5001/${task.attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm hover:underline"
                  >
                    View Attachment
                  </a>
                  <button
                    onClick={() => handleDeleteAttachment(task.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete Attachment
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
