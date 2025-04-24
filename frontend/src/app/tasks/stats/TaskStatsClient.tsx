"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import api from "@/lib/api";


const COLORS = ["#7c3aed", "#10b981", "#fbbf24", "#ef4444"];

export default function TaskStatsPage() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get("/tasks/stats");
      const stats = res.data as Record<string, number>;

      const formatted = Object.keys(stats).map((key) => ({
        name: key.replace("_", " "),
        value: stats[key],
      }));

      setData(formatted);
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Task Status Overview</h1>
      <div className="bg-neutral-900/70 backdrop-blur rounded-2xl p-8 border border-neutral-800 shadow-lg w-full max-w-3xl">
        <PieChart width={500} height={400} className="mx-auto">
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={130}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}