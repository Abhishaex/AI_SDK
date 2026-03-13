"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef } from "react";
import { Wrench, Sun, Calculator, Clock, AlertCircle, Ban } from "lucide-react";

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

  const isRunning =
    part.state === "input-streaming" || part.state === "input-available";
  const isError = part.state === "output-error";
  const isDenied = part.state === "output-denied";
  const isSuccess = part.state === "output-available";

  return (
    <div
      className={`mt-3 overflow-hidden rounded-2xl border backdrop-blur-md shadow-lg text-left w-full md:w-[400px] ${
        isError
          ? "border-red-500/30 bg-red-500/5"
          : isDenied
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/5">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg shadow-inner ${
            isError
              ? "bg-red-500/20"
              : isDenied
                ? "bg-amber-500/20"
                : "bg-amber-500/20"
          }`}
        >
          {isError ? (
            <AlertCircle className="h-4 w-4 text-red-400" />
          ) : isDenied ? (
            <Ban className="h-4 w-4 text-amber-400" />
          ) : (
            <Icon className="h-4 w-4 text-amber-400" />
          )}
        </div>
        <span
          className={`text-xs font-semibold uppercase tracking-widest ${
            isError
              ? "text-red-400/90"
              : isDenied
                ? "text-amber-400/90"
                : "text-amber-400/90"
          }`}
        >
          {name}
        </span>

        <div className="ml-auto flex items-center gap-2 text-[10px] font-medium tracking-widest uppercase">
          {isRunning && (
            <span className="flex items-center gap-1.5 text-amber-400/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              Calling
            </span>
          )}
          {isSuccess && (
            <span className="text-emerald-400/90 font-medium">✓ Success</span>
          )}
          {isError && (
            <span className="flex items-center gap-1 text-red-400 font-medium">
              <AlertCircle className="h-3 w-3" />
              Failed
            </span>
          )}
          {isDenied && (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Ban className="h-3 w-3" />
              Denied
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {part.input != null &&
          typeof part.input === "object" &&
          Object.keys(part.input).length > 0 && (
            <div>
              <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                Input
              </div>
              <pre className="custom-scrollbar overflow-x-auto rounded-xl border border-white/5 bg-black/40 px-3 py-2.5 text-[11px] leading-relaxed text-white/70">
                {JSON.stringify(part.input, null, 2)}
              </pre>
            </div>
          )}
        {isSuccess && part.output != null && (
          <div>
            <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
              Output
            </div>
            <pre className="custom-scrollbar overflow-x-auto rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-emerald-300/90">
              {JSON.stringify(part.output, null, 2)}
            </pre>
          </div>
        )}
        {isError && part.errorText && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-red-400/90">
              <AlertCircle className="h-3 w-3" />
              Tool error
            </div>
            <p className="text-xs leading-relaxed text-red-300/95">
              {part.errorText}
            </p>
          </div>
        )}
        {isDenied && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-400/90">
              <Ban className="h-3 w-3" />
              Execution denied
            </div>
            <p className="text-xs text-amber-300/90">
              This tool call was not approved.
            </p>
          </div>
        )}
      </div>
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
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-20 flex items-center justify-between px-6 lg:px-8 py-4 border-b border-white/5 backdrop-blur-md bg-black/40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 lg:ml-0 ml-12">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Tools Chat
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Weather · Calc · Time</span>
            </div>
          </div>
        </div>
      </header>

      <main 
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar pb-10"
      >
        {(messages || []).length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto opacity-60">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-center">
              <Wrench className="w-10 h-10 text-amber-500/50" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Chat with context</h2>
              <p className="text-sm font-light mt-2 leading-relaxed text-white/60">
                Ask about the weather, perform calculations, or get the current date and time. Nexus will use tools dynamically.
              </p>
            </div>
          </div>
        )}

        {messages?.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-4 ${
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            } animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-black/20 ${
              m.role === "user" 
                ? "bg-gradient-to-br from-zinc-700 to-zinc-900" 
                : "bg-gradient-to-br from-amber-500 to-orange-600"
            }`}>
              {m.role === "user" ? "U" : "AI"}
            </div>

            <div className={`flex flex-col max-w-[90%] md:max-w-[75%] space-y-2 ${
              m.role === "user" ? "items-end text-right" : "items-start text-left"
            }`}>
              {/* Only render text bubbles if there is actual text */}
              {m.parts?.some((p) => p.type === "text" && p.text?.trim()) && (
                <div className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border ${
                  m.role === "user"
                    ? "bg-zinc-800/80 border-white/5 text-white/90 rounded-tr-none"
                    : "bg-white/5 border-white/10 text-white/90 backdrop-blur-md shadow-xl rounded-tl-none"
                }`}>
                  {m.parts?.map((part, i) => {
                    if (part.type === "text" && part.text.trim()) {
                      return (
                        <p key={i} className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-light">
                          {part.text}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              {/* Tool calls section - label + cards */}
              {m.role === "assistant" &&
                m.parts?.some(
                  (p) =>
                    (typeof p.type === "string" && p.type.startsWith("tool-")) ||
                    p.type === "dynamic-tool"
                ) && (
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-amber-400/70">
                    <Wrench className="h-3.5 w-3.5" />
                    Tool calls
                  </div>
                )}
              {m.parts?.map((part, i) => {
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

              <div className="text-[10px] text-white/20 font-mono tracking-tighter px-2 mt-1">
                {m.role === "assistant" ? "Nexus Tools" : "You"}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && messages?.[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-start gap-4 animate-in fade-in duration-300">
            <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-black/20">
              AI
            </div>
            <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl rounded-tl-none flex items-center h-[52px] md:h-[60px]">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-sm animate-in fade-in">
            {error.message}
          </div>
        )}
      </main>

      <footer className="relative z-20 p-4 md:p-6 bg-[#050505] border-t border-white/5 mt-auto">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
          <div className="relative flex items-center bg-zinc-900/90 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden p-1.5">
            <input
              value={input ?? ""}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about weather, math, or current time..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm md:text-base text-white/90 placeholder:text-white/20"
            />
            <button
              type="submit"
              disabled={isLoading || !(input?.trim())}
              className="p-3 rounded-xl bg-white text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:grayscale flex items-center justify-center"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 7-7 7 7"/>
                <path d="M12 19V5"/>
              </svg>
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center mt-3 text-white/20 font-light tracking-wide italic">
          Nexus uses tools dynamically to provide accurate answers.
        </p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
