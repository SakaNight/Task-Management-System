"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  attachment?: string;
};

const statusOptions = ["todo", "in_progress", "stuck", "done"];

export default function TaskListPage() {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      fetchTasks(); // ✅ 加这一句！
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get<Task[]>("/tasks");
      setTasks(res.data);
    } catch (err) {
      // setError("Failed to fetch tasks");
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
      fetchTasks(); // 🔄 刷新列表
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks(); // 刷新列表
    } catch (err) {
      alert("Failed to update task status");
    }
  };

  const [filter, setFilter] = useState("all");
  const filteredTasks = tasks.filter((task) =>
    filter === "all" ? true : task.status === filter
  );

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks(); // 删除后刷新任务列表
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const handleFileUpload = async (taskId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      await api.post(`/tasks/${taskId}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchTasks(); // 上传成功后刷新任务列表
    } catch (err) {
      alert("Failed to upload file");
    }
  };

  const handleDeleteAttachment = async (taskId: number) => {
    try {
      await api.delete(`/tasks/${taskId}/attachment`);
      fetchTasks(); // 刷新任务
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
      fetchTasks(); // 刷新任务
    } catch (err) {
      alert("Failed to update task");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Tasks</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
        <button
          onClick={() => router.push("/tasks/stats")}
          className="text-sm text-blue-600 hover:underline"
        >
          View Stats
        </button>
      </div>

      {/* 新建任务表单 */}
      <form onSubmit={handleCreateTask} className="bg-white p-4 shadow rounded space-y-4">
        <h2 className="text-xl font-semibold">Create New Task</h2>
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          className="w-full p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select
          className="w-full p-2 border rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="flex justify-end">
        <select
          className="p-2 border rounded"
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
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Task
        </button>
      </form>

      {/* 任务列表 */}
      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredTasks.map((task) => (
            <li key={task.id} className="p-4 bg-white shadow rounded">
              {editingTaskId === task.id.toString() ? (
                <form
                  onSubmit={(e) => handleSaveEdit(e, task.id.toString())}
                  className="space-y-2 mt-2"
                >
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    className="w-full border p-2 rounded"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
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
                  <h2 className="font-semibold text-lg">{task.title}</h2>
                  <p className="text-gray-600">{task.description}</p>
                </>
              )}

              <div className="flex items-center gap-2 mt-2">
                <select
                  className="p-1 border rounded"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setEditingTaskId(task.id.toString());
                    setEditedTitle(task.title);
                    setEditedDescription(task.description || "");
                    setEditedStatus(task.status);
                  }}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* ✅ 上传文件区域 */}
              <div className="mt-2">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(task.id, file);
                  }}
                />
              </div>

              {/* ✅ 显示下载链接 */}
              {task.attachment && (
                <div className="flex gap-2 mt-2 items-center">
                  <a
                    href={`http://localhost:5001/${task.attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View Attachment
                  </a>

                  <button
                    onClick={() => handleDeleteAttachment(task.id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete Attachment
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}