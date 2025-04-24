import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Management System",
  description: "Efficiently manage your tasks with modern UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`bg-black text-white ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <main className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-900/70 p-8 shadow-lg backdrop-blur">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
