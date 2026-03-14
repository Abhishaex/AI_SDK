"use client";

import { useState, useEffect, useRef } from "react";
import { ImageIcon, Download, Loader2, Trash2 } from "lucide-react";

type Message =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string; imageUrl: string };

export default function GenerateImageUI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userPrompt = input.trim();
    setInput("");
    setError(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userPrompt,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to generate image");
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        return;
      }

      if (data.url) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: userPrompt,
          imageUrl: data.url,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setError("No image URL in response");
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      }
    } catch (err) {
      console.error("Generate image error:", err);
      setError("Something went wrong. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, prompt: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `dall-e-${Date.now()}.png`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  const handleClearHistory = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[100px] rounded-full" />
      </div>

      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-md bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ImageIcon className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              DALL·E Image Generator
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">
                DALL·E 3 • 1024×1024
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-xs font-medium hover:bg-white/10 transition-colors"
            >
              <Trash2 size={14} />
              Clear
            </button>
          )}
        </div>
      </header>

      <main
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar pb-10"
      >
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto opacity-40">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ImageIcon size={40} className="text-amber-500/60" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Describe your image
              </h2>
              <p className="text-sm font-light mt-2 leading-relaxed">
                Enter a prompt below to generate images with DALL·E 3. Each
                request creates a 1024×1024 image.
              </p>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-4 ${
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            } animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-black/20 ${
                m.role === "user"
                  ? "bg-gradient-to-br from-zinc-700 to-zinc-900"
                  : "bg-gradient-to-br from-amber-500 to-orange-600"
              }`}
            >
              {m.role === "user" ? (
                <span>U</span>
              ) : (
                <ImageIcon size={16} className="text-white" />
              )}
            </div>

            <div
              className={`max-w-[85%] md:max-w-[70%] space-y-1 ${
                m.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border ${
                  m.role === "user"
                    ? "bg-zinc-800/80 border-white/5 text-white/90 rounded-tr-none"
                    : "bg-white/5 border-white/10 backdrop-blur-md shadow-xl rounded-tl-none overflow-hidden"
                }`}
              >
                {m.role === "user" ? (
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-light">
                    {m.content}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <img
                      src={m.imageUrl}
                      alt={m.content.slice(0, 100)}
                      className="w-full h-auto rounded-xl border border-white/10 shadow-2xl max-w-[512px]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(m.imageUrl, m.content)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-xs font-medium"
                      >
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-[10px] text-white/20 font-mono tracking-tighter px-2">
                {m.role === "assistant" ? "DALL·E" : "You"}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-4 animate-in fade-in duration-300">
            <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-black/20">
              <ImageIcon size={16} className="text-white" />
            </div>
            <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl rounded-tl-none">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-24 h-24 rounded-2xl bg-white/10 animate-pulse" />
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500/60 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-amber-500/60 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-amber-500/60 animate-bounce [animation-delay:300ms]" />
                </div>
                <p className="text-sm text-white/50">Creating your image...</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-20 p-4 md:p-6 bg-[#050505] border-t border-white/5">
        {error && (
          <div className="max-w-3xl mx-auto mb-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
          <div className="relative flex items-center bg-zinc-900/90 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden p-1.5">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              placeholder="Describe the image you want to create..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm md:text-base text-white/90 placeholder:text-white/20"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-xl bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:grayscale"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ImageIcon size={18} />
              )}
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center mt-3 text-white/20 font-light tracking-wide italic">
          Generated images are created by DALL·E 3. Check usage policies.
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
