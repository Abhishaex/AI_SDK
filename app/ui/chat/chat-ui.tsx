"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export default function ChatUI() {
  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;
    sendMessage({ text: input });
    setInput("");
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-sm font-bold tracking-tighter">AI</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Nexus Chat
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-medium tracking-widest uppercase text-white/40">
            Chat
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden h-[calc(100vh-80px)]">
        {/* Messages area */}
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-indigo-400/60"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-sm font-light tracking-wide">
                  Start a conversation with the AI
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-white/10"
                      : "bg-gradient-to-br from-indigo-500 to-purple-600"
                  }`}
                >
                  {message.role === "user" ? (
                    <span className="text-xs font-medium">U</span>
                  ) : (
                    <span className="text-xs font-bold">AI</span>
                  )}
                </div>
                <div
                  className={`flex-1 min-w-0 rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-white/10 text-white/90"
                      : "bg-white/5 border border-white/5 text-white/80"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.parts
                      .filter((part): part is { type: "text"; text: string } => part.type === "text")
                      .map((part, i) => (
                        <span key={i}>{part.text}</span>
                      ))}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && status === "submitted" && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xs font-bold">AI</span>
                </div>
                <div className="flex-1 rounded-2xl px-4 py-3 bg-white/5 border border-white/5">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Error display */}
        {error && (
          <div className="px-4 sm:px-6 lg:px-8 pb-2">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-sm text-red-400">Something went wrong.</p>
              <button
                type="button"
                onClick={() => regenerate()}
                className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Input area */}
        <section className="relative z-10 flex-shrink-0 p-4 sm:p-6 lg:p-8 border-t border-white/5 bg-black/20">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="flex gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 focus-within:border-indigo-500/30 transition-colors"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
                placeholder="Type your message..."
                disabled={status !== "ready"}
                rows={1}
                className="flex-1 min-h-[44px] max-h-32 py-3 px-4 bg-transparent border-none focus:ring-0 resize-none text-base text-white/90 placeholder:text-white/30 custom-scrollbar"
              />
              <div className="flex items-center gap-2">
                {isLoading && (
                  <button
                    type="button"
                    onClick={stop}
                    className="px-3 py-2 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                  >
                    Stop
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!input.trim() || status !== "ready"}
                  className="group px-4 py-2 rounded-xl bg-white text-black font-semibold overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    Send
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      <path
                        d="M2 8h12M9 4l5 4-5 4V4z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
