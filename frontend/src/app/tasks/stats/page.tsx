"use client";

import dynamic from "next/dynamic";

const TaskStatsClient = dynamic(() => import("./TaskStatsClient"), {
  ssr: false,
});

export default function TaskStatsPageWrapper() {
  return <TaskStatsClient />;
}