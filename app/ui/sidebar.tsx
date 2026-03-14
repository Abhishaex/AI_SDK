"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  ImagePlus,
  Mic,
  Volume2,
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
  { name: "Transcribe Audio", href: "/transcribe-audio", icon: Mic },
  { name: "Generate Image", href: "/generate-image", icon: ImagePlus },
  { name: "Generate Speech", href: "/generate-speech", icon: Volume2 },
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
      <style jsx global>{`
        /* Shift all headers' first child when sidebar is closed on mobile/desktop */
        .sidebar-closed header > div:first-child {
          padding-left: 3.5rem !important;
          transition: padding-left 0.3s ease-in-out;
        }
        .sidebar-open header > div:first-child {
          padding-left: 0 !important;
          transition: padding-left 0.3s ease-in-out;
        }
        /* Dashboard specific fix */
        .sidebar-closed .dashboard-header {
          padding-left: 3.5rem !important;
          transition: padding-left 0.3s ease-in-out;
        }
      `}</style>

      <button 
        onClick={toggle}
        className={`
          fixed z-50 p-2 rounded-lg transition-all duration-300 flex items-center justify-center
          ${isOpen 
            ? "top-4 left-4 bg-transparent text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 lg:left-[210px] lg:top-[20px]" 
            : "top-4 left-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-lg text-zinc-600 dark:text-zinc-400 hover:scale-110 active:scale-95 ring-1 ring-black/5 dark:ring-white/5"}
        `}
        title={isOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        {isOpen ? <PanelLeftClose size={20} /> : <Menu size={22} />}
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
            {/* Empty space for the button that will be positioned here */}
            <div className="w-8" />
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
