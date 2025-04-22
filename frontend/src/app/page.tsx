"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Task Management System</h1>
      <p className="text-lg mb-8">This is the frontend built with Next.js and TailwindCSS.</p>
      <button
        onClick={() => router.push("/login")}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Login
      </button>
    </div>
  );
}