"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type LoginResponse = {
  access_token: string;
  token_type: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const res = await axios.post<LoginResponse>(
        "http://localhost:5001/auth/login",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem("token", res.data.access_token);
      console.log("Login success. Token:", res.data.access_token);
      router.replace("/tasks");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-zinc-900 border border-zinc-800">
        <h2 className="text-center text-3xl font-bold text-white mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <button
            type="submit"
            className="w-full py-2 px-4 bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}