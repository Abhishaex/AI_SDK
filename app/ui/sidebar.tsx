"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Zap, 
  List, 
  Database, 
  Hash, 
  LayoutDashboard,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { useSidebar } from "./sidebar-provider";

const navItems = [
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Multi-modal Chat", href: "/multi-modal-chat", icon: ImageIcon },
  { name: "Completions", href: "/completions", icon: Zap },
  { name: "Stream", href: "/stream", icon: Zap },
  { name: "Structured Array", href: "/structured-array", icon: List },
  { name: "Structured Data", href: "/structured-data", icon: Database },
  { name: "Structured Enum", href: "/structured-enum", icon: Hash },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle, setIsOpen } = useSidebar();

  return (
    <>
      {/* Mobile Menu Button - Only visible when sidebar is closed and on mobile/desktop as a floating button or in header */}
      <button 
        onClick={toggle}
        className={`
          fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg transition-all duration-300
          ${isOpen ? "opacity-0 pointer-events-none -translate-x-full" : "opacity-100 translate-x-0"}
        `}
      >
        <Menu size={20} className="text-zinc-600 dark:text-zinc-400" />
      </button>

      {/* Sidebar Overlay (Mobile) */}
      <div 
        className={`
          fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 z-40 w-64 h-screen transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8 px-2 py-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Zap className="text-white" size={18} />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                AI Studio
              </span>
            </div>
            <button 
              onClick={toggle}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
              title="Close sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            <Link 
              href="/"
              onClick={() => {
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${pathname === "/" 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900"}
              `}
            >
              <LayoutDashboard size={20} />
              <span className="font-semibold text-sm">Dashboard</span>
            </Link>

            <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em]">
              API Capabilities
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900"}
                  `}
                >
                  <Icon size={20} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="px-3 py-2 text-[11px] text-zinc-500 font-medium">
              v1.0.4 AI SDK Core
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
