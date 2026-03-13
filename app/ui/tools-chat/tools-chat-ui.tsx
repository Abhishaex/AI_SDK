"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Wrench, Sun, Calculator, Clock } from "lucide-react";

function getToolName(part: { type: string; toolName?: string }): string {
  if (part.type.startsWith("tool-")) {
    return part.type.slice(5);
  }
  return (part as { toolName?: string }).toolName ?? "tool";
}

function ToolPartCard({
  part,
}: {
  part: {
    type: string;
    toolName?: string;
    toolCallId: string;
    state: string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
  };
}) {
  const name = getToolName(part);
  const Icon =
    name === "weather"
      ? Sun
      : name === "calculator"
        ? Calculator
        : name === "getCurrentDateTime"
          ? Clock
          : Wrench;

  return (
    <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-left">
      <div className="flex items-center gap-2 text-amber-400/90 text-xs font-medium">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/20">
          <Icon className="h-3 w-3" />
        </span>
        <span className="uppercase tracking-wider">{name}</span>
        {(part.state === "input-streaming" ||
          part.state === "input-available") && (
          <span className="text-white/40">Running…</span>
        )}
        {part.state === "output-available" && (
          <span className="text-emerald-400/80">Done</span>
        )}
        {part.state === "output-error" && (
          <span className="text-red-400/80">Error</span>
        )}
      </div>
      {part.input != null && Object.keys(part.input as object).length > 0 && (
        <pre className="mt-1.5 overflow-x-auto rounded bg-black/30 px-2 py-1 text-[10px] text-white/60">
          {JSON.stringify(part.input, null, 0)}
        </pre>
      )}
      {part.state === "output-available" && part.output != null && (
        <pre className="mt-1.5 overflow-x-auto rounded bg-black/30 px-2 py-1.5 text-[11px] text-emerald-300/90">
          {JSON.stringify(part.output, null, 2)}
        </pre>
      )}
      {part.state === "output-error" && part.errorText && (
        <p className="mt-1.5 text-xs text-red-400/90">{part.errorText}</p>
      )}
    </div>
  );
}

export default function ToolsChatUI() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat-with-tools" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage({ text: input });
    setInput("");
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white font-sans selection:bg-amber-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-20 flex items-center justify-between border-b border-white/5 bg-black/40 px-4 py-3 backdrop-blur-md md:px-6">
        <Link
          href="/"
          className="text-white/50 hover:text-white transition-colors text-sm"
        >
          ← Home
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">
              Tools Chat
            </h1>
            <p className="text-[10px] text-white/40">
              Weather · Calculator · Date/Time
            </p>
          </div>
        </div>
        <div className="w-14" />
      </header>

      <main
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto p-4 pb-24 md:p-8 custom-scrollbar"
      >
        {(messages ?? []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <Wrench className="h-10 w-10 text-amber-500/60" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Chat with tools
            </h2>
            <p className="mt-2 max-w-sm text-sm text-white/50">
              Ask for the weather, math (e.g. “What’s 15 × 7?”), or the current
              date and time. The model can use tools to answer.
            </p>
          </div>
        )}

        {messages?.map((m) => (
          <div
            key={m.id}
            className={`mb-6 flex gap-4 ${
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`shrink-0 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full text-xs font-bold ${
                m.role === "user"
                  ? "bg-zinc-700"
                  : "bg-gradient-to-br from-amber-500 to-orange-600"
              }`}
            >
              {m.role === "user" ? "U" : "AI"}
            </div>

            <div
              className={`flex max-w-[85%] flex-col gap-1 md:max-w-[75%] ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`rounded-2xl border px-4 py-3 ${
                  m.role === "user"
                    ? "rounded-tr-sm border-white/10 bg-zinc-800/80"
                    : "rounded-tl-sm border-amber-500/20 bg-white/5"
                }`}
              >
                {m.parts?.map((part, i) => {
                  if (part.type === "text") {
                    return (
                      <p
                        key={i}
                        className="whitespace-pre-wrap text-sm leading-relaxed text-white/90"
                      >
                        {part.text}
                      </p>
                    );
                  }
                  if (
                    part.type.startsWith("tool-") ||
                    part.type === "dynamic-tool"
                  ) {
                    return (
                      <ToolPartCard
                        key={i}
                        part={
                          part as {
                            type: string;
                            toolName?: string;
                            toolCallId: string;
                            state: string;
                            input?: unknown;
                            output?: unknown;
                            errorText?: string;
                          }
                        }
                      />
                    );
                  }
                  return null;
                })}
              </div>
              <span className="text-[10px] text-white/30">
                {m.role === "assistant" ? "Assistant" : "You"}
              </span>
            </div>
          </div>
        ))}

        {isLoading && messages?.[messages.length - 1]?.role !== "assistant" && (
          <div className="mb-6 flex gap-4">
            <div className="shrink-0 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold">
              AI
            </div>
            <div className="flex gap-1.5 rounded-2xl border border-amber-500/20 bg-white/5 px-4 py-3">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.3s]" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.15s]" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500" />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error.message}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/5 bg-[#050505] p-4 md:p-6">
        <form
          onSubmit={handleSubmit}
          className="relative mx-auto max-w-3xl"
        >
          <div className="flex items-center overflow-hidden rounded-2xl border border-amber-500/20 bg-zinc-900/90 p-1.5 backdrop-blur-xl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask weather, math, or current time..."
              className="flex-1 border-none bg-transparent px-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-0 md:text-base"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500"
            >
              Send
            </button>
          </div>
        </form>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.12);
        }
      `}</style>
    </div>
  );
}
