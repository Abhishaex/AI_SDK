"use client";

import { useCallback, useRef, useState } from "react";

type Usage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export default function StreamUI() {
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prompt.trim()) return;

      setIsLoading(true);
      setError(undefined);
      setCompletion("");
      setUsage(null);
      abortRef.current = new AbortController();

      let result = "";
      try {
        const res = await fetch("/api/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error("Stream request failed");
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const payload = line.slice(6);
              if (payload === "[DONE]") continue;
              try {
                const data = JSON.parse(payload);
                if (data.type === "text-delta" && data.delta) {
                  result += data.delta;
                  setCompletion(result);
                } else if (data.type === "finish" && data.messageMetadata?.usage) {
                  const u = data.messageMetadata.usage;
                  setUsage({
                    inputTokens: u.inputTokens ?? 0,
                    outputTokens: u.outputTokens ?? 0,
                    totalTokens: u.totalTokens ?? 0,
                  });
                }
              } catch {
                // skip parse errors
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(err instanceof Error ? err : new Error("Stream failed"));
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [prompt]
  );

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
            Nexus AI Stream
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-medium tracking-widest uppercase text-emerald-400/80">
            Live stream
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col-reverse lg:flex-row overflow-hidden h-[calc(100vh-80px)]">
        {/* Left Side: Input */}
        <section className="flex-[1.2] lg:flex-none lg:w-1/2 flex flex-col p-4 sm:p-6 lg:p-8 border-t lg:border-t-0 lg:border-r border-white/5 overflow-hidden">
          <div className="flex flex-col h-full bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="px-5 py-3 md:px-6 md:py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-white/50">
                Prompt Editor
              </h2>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-500/30" />
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow-500/30" />
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-500/30" />
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col p-4 md:p-6 gap-4 md:gap-6"
            >
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your prompt here... Text will stream as it's generated."
                className="flex-1 w-full bg-transparent border-none focus:ring-0 resize-none text-base md:text-lg text-white/90 placeholder:text-white/20 leading-relaxed font-light custom-scrollbar"
              />

              <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-white/5">
                <span className="text-[10px] text-white/30 font-mono">
                  {prompt.length} characters
                </span>
                <div className="flex items-center gap-2">
                  {isLoading && (
                    <button
                      type="button"
                      onClick={stop}
                      className="px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
                    >
                      Stop
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    className="group relative px-4 py-2 md:px-6 md:py-3 rounded-xl bg-white text-black font-semibold overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                    <span className="relative flex items-center gap-2 text-sm md:text-base">
                      {isLoading ? "Streaming..." : "Stream"}
                      {!isLoading && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="transition-transform group-hover:translate-x-1 lg:w-4 lg:h-4"
                        >
                          <path
                            d="M5.5 12L9.5 8L5.5 4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* Right Side: Streaming Output */}
        <section className="flex-1 lg:w-1/2 flex flex-col p-4 sm:p-6 lg:p-8 bg-[#0a0a0a]/50 lg:bg-[#0a0a0a] overflow-hidden">
          <div className="flex flex-col h-full bg-black/40 rounded-2xl md:rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="px-5 py-3 md:px-6 md:py-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
              <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-white/50">
                Streamed Result
              </h2>
              {isLoading && (
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>

            <div className="flex-1 p-5 md:p-8 overflow-y-auto custom-scrollbar">
              {error ? (
                <p className="text-sm text-red-400/90">{error.message}</p>
              ) : completion ? (
                <div className="prose prose-invert max-w-none">
                  <p className="text-sm md:text-lg leading-relaxed text-white/80 font-light whitespace-pre-wrap">
                    {completion}
                    {isLoading && (
                      <span className="inline-block w-2 h-4 ml-0.5 bg-white/70 animate-pulse align-middle" />
                    )}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 opacity-20">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="md:w-12 md:h-12"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <p className="text-xs md:text-sm font-light tracking-wide italic">
                    Output streams here as it&apos;s generated
                  </p>
                </div>
              )}
            </div>

            {completion && (
              <div className="px-5 py-3 md:px-6 md:py-4 border-t border-white/5 bg-black/40 flex items-center justify-end gap-4">
                {usage && (
                  <div className="text-[10px] md:text-xs font-mono text-white/40 flex items-center gap-3 md:gap-4">
                    <span>
                      In: <span className="text-white/60">{usage.inputTokens}</span>
                    </span>
                    <span>
                      Out: <span className="text-white/60">{usage.outputTokens}</span>
                    </span>
                    <span>
                      Total: <span className="text-white/60">{usage.totalTokens}</span> tokens
                    </span>
                  </div>
                )}
                <button
                  onClick={() => navigator.clipboard.writeText(completion)}
                  className="p-1.5 md:p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white shrink-0"
                  title="Copy to clipboard"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="md:w-[18px] md:h-[18px]"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
