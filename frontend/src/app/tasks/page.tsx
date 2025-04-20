"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
};

const statusOptions = ["todo", "in_progress", "stuck", "done"];

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get<Task[]>("/tasks");
      setTasks(res.data);
    } catch (err) {
      setError("Failed to fetch tasks");
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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Your Tasks</h1>

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
          {tasks.map((task) => (
            <li key={task.id} className="p-4 bg-white shadow rounded">
              <h2 className="font-semibold text-lg">{task.title}</h2>
              <p className="text-gray-600">{task.description}</p>
              <span className="inline-block mt-2 px-3 py-1 text-sm rounded bg-blue-100 text-blue-800">
                {task.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}