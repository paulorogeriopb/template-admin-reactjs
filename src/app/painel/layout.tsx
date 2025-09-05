"use client";

import { ThemeProvider } from "next-themes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-white dark:bg-gray-900">{children}</div>
    </ThemeProvider>
  );
}
