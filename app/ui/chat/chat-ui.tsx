"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef } from "react";

export default function ChatUI() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/stream" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

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
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-md bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-lg font-bold tracking-tighter">NX</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Nexus Chat
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">GPT-5 Nano Online</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-xs font-medium hover:bg-white/10 transition-colors">
            Clear History
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <main 
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar pb-32"
      >
        {(messages || []).length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto opacity-40">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Start a conversation</h2>
              <p className="text-sm font-light mt-2 leading-relaxed">
                Ask anything to Nexus AI. It can help you with coding, writing, or just general questions.
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
            {/* Avatar */}
            <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-black/20 ${
              m.role === "user" 
                ? "bg-gradient-to-br from-zinc-700 to-zinc-900" 
                : "bg-gradient-to-br from-indigo-500 to-purple-600"
            }`}>
              {m.role === "user" ? "U" : "AI"}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-[85%] md:max-w-[70%] space-y-1 ${
              m.role === "user" ? "text-right" : "text-left"
            }`}>
              <div className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border ${
                m.role === "user"
                  ? "bg-zinc-800/80 border-white/5 text-white/90 rounded-tr-none"
                  : "bg-white/5 border-white/10 text-white/90 backdrop-blur-md shadow-xl rounded-tl-none"
              }`}>
                {m.parts?.map((part, i) => {
                  if (part.type === "text") {
                    return (
                      <p key={i} className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-light">
                        {part.text}
                      </p>
                    );
                  }
                  // Handle other part types if necessary
                  return null;
                })}
              </div>
              <div className="text-[10px] text-white/20 font-mono tracking-tighter px-2">
                {m.role === "assistant" ? "Nexus AI" : "You"}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && messages?.[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-start gap-4 animate-in fade-in duration-300">
            <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-black/20">
              AI
            </div>
            <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl rounded-tl-none">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
          <div className="relative flex items-center bg-zinc-900/90 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden p-1.5">
            <input
              value={input ?? ""}
              onChange={handleInputChange}
              placeholder="Message Nexus AI..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm md:text-base text-white/90 placeholder:text-white/20"
            />
            <button
              type="submit"
              disabled={isLoading || !(input?.trim())}
              className="p-3 rounded-xl bg-white text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:grayscale"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 7-7 7 7"/>
                <path d="M12 19V5"/>
              </svg>
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center mt-3 text-white/20 font-light tracking-wide italic">
          Nexus can make mistakes. Check important info.
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
