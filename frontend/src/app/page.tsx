"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="space-y-16">
      {/* 欢迎区域 */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Welcome to the Task Management System
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Manage your tasks efficiently with a modern, beautiful interface.
        </p>
        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-md transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/register")}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold border border-gray-600 rounded-md transition-colors"
          >
            Register
          </button>
        </div>
      </section>

      {/* 内容区块 */}
      <section className="grid sm:grid-cols-3 gap-6 text-center">
        <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 shadow">
          <h3 className="text-xl font-semibold text-white mb-2">📋 Features</h3>
          <p className="text-gray-400 text-sm">
            Task creation, filtering, file attachments, statistics visualization, and JWT-authenticated access.
          </p>
        </div>

        <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 shadow">
          <h3 className="text-xl font-semibold text-white mb-2">⚙️ Tech Stack</h3>
          <p className="text-gray-400 text-sm">
            React (Next.js) · Tailwind CSS · FastAPI · PostgreSQL · Prisma ORM · Docker · GitHub Actions CI/CD
          </p>
        </div>

        <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 shadow">
          <h3 className="text-xl font-semibold text-white mb-2">☁️ Deployment</h3>
          <p className="text-gray-400 text-sm">
            Deployed on AWS EC2 · Automated testing & release pipeline with GitHub Actions · Containerized with Docker
          </p>
        </div>
      </section>
    </div>
  );
}