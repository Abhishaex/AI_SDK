"use client";

import Link from "next/link";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  ImagePlus,
  Mic,
  Zap, 
  List, 
  Database, 
  Hash, 
  ArrowRight,
  Code2,
  Wrench,
  Layers
} from "lucide-react";

const cards = [
  { 
    title: "Tools Chat", 
    description: "Chat with AI that can use tools (weather, calculator, date/time).", 
    href: "/tools-chat", 
    icon: Wrench,
    color: "bg-amber-500"
  },
  { 
    title: "Multiple Tools Chat", 
    description: "AI calls multiple tools in one response — weather, calc, time, random, joke.", 
    href: "/multiple-tools", 
    icon: Layers,
    color: "bg-indigo-500"
  },
  { 
    title: "AI Chat", 
    description: "Standard chat interface with AI SDK streaming.", 
    href: "/chat", 
    icon: MessageSquare,
    color: "bg-blue-500"
  },
  { 
    title: "Multi-modal Chat", 
    description: "Chat with support for images and vision.", 
    href: "/multi-modal-chat", 
    icon: ImageIcon,
    color: "bg-purple-500"
  },
  { 
    title: "Transcribe Audio", 
    description: "Convert speech to text using OpenAI Whisper.", 
    href: "/transcribe-audio", 
    icon: Mic,
    color: "bg-violet-500"
  },
  { 
    title: "Generate Image", 
    description: "Create images from text using DALL·E (1024×1024).", 
    href: "/generate-image", 
    icon: ImagePlus,
    color: "bg-amber-500"
  },
  { 
    title: "Completions", 
    description: "Simple text generation using the completion API.", 
    href: "/completions", 
    icon: Zap,
    color: "bg-indigo-500"
  },
  { 
    title: "Stream", 
    description: "Real-time AI response streaming example.", 
    href: "/stream", 
    icon: Zap,
    color: "bg-amber-500"
  },
  { 
    title: "Structured Array", 
    description: "Generating lists and arrays of structured data.", 
    href: "/structured-array", 
    icon: List,
    color: "bg-cyan-500"
  },
  { 
    title: "Structured Data", 
    description: "Complex object generation using Zod schemas.", 
    href: "/structured-data", 
    icon: Database,
    color: "bg-emerald-500"
  },
  { 
    title: "Structured Enum", 
    description: "Classifying content with predefined enums.", 
    href: "/structured-enum", 
    icon: Hash,
    color: "bg-rose-500"
  },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8 px-4">
      <div className="space-y-3 mt-4">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
          AI SDK <span className="text-blue-500">Explorer</span>
        </h1>
        <p className="text-zinc-400 text-base max-w-xl leading-relaxed">
          Explore various implementations and capabilities of the Vercel AI SDK. 
          Each example demonstrates a specific feature or API route.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link 
              key={card.href}
              href={card.href}
              className="group relative p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all duration-300"
            >
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                <Icon className="text-white" size={20} />
              </div>
              <h2 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
                {card.title}
                <ArrowRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" size={16} />
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="p-6 bg-gradient-to-r from-blue-600/5 to-purple-600/5 border border-blue-500/10 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Code2 className="text-blue-500" size={20} />
              Developer Tools
            </h2>
            <p className="text-zinc-400 text-sm">
              This application is built with Next.js 15, Tailwind CSS, and the Vercel AI SDK.
              Check the source code to see how these APIs are integrated.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 text-xs font-medium">
              Next.js 15.1
            </div>
            <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 text-xs font-medium">
              AI SDK 4.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
