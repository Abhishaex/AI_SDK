"use client";

import { useSidebar } from "./sidebar-provider";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <main className={`
      flex-1 min-h-screen relative transition-all duration-300 ease-in-out
      ${isOpen ? "lg:ml-64" : "lg:ml-0"}
    `}>
      {children}
    </main>
  );
}
