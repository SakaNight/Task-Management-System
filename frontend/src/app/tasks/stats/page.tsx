"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import api from "@/lib/api";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff6b6b"];

export default function TaskStatsPage() {
    const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get("/tasks/stats");
      const stats = res.data as Record<string, number>;

      // 转换为 Recharts 需要的数据格式
      const formatted = Object.keys(stats).map((key) => ({
        name: key.replace("_", " "),
        value: stats[key],
      }));

      setData(formatted);
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-6">Task Status Statistics</h2>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}