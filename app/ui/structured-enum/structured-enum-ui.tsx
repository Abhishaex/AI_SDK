"use client";

import { useState } from "react";
import { Spinner } from "../loader";

type SentimentValue = "positive" | "negative" | "neutral";

export default function StructuredEnumUI() {
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState<SentimentValue | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSentiment(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/structured-enum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text.trim() || "I love this product! It works great.",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      if (data.object?.sentiment) setSentiment(data.object.sentiment);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const sentimentStyles: Record<
    SentimentValue,
    { bg: string; label: string; emoji: string }
  > = {
    positive: {
      bg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
      label: "Positive",
      emoji: "😊",
    },
    negative: {
      bg: "bg-rose-500/20 border-rose-500/40 text-rose-300",
      label: "Negative",
      emoji: "😞",
    },
    neutral: {
      bg: "bg-slate-500/20 border-slate-500/40 text-slate-300",
      label: "Neutral",
      emoji: "😐",
    },
  };

  const style = sentiment ? sentimentStyles[sentiment] : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white font-sans selection:bg-violet-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-sm font-bold tracking-tighter">✨</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Sentiment Classifier
          </h1>
        </div>
        <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-medium tracking-widest uppercase text-white/40">
          Structured enum
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col-reverse lg:flex-row overflow-hidden h-[calc(100vh-80px)]">
        <section className="flex-[1.2] lg:flex-none lg:w-1/2 flex flex-col p-4 sm:p-6 lg:p-8 border-t lg:border-t-0 lg:border-r border-white/5 overflow-hidden">
          <div className="flex flex-col h-full bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="px-5 py-3 md:px-6 md:py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-white/50">
                Enter text
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
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. I love this product! / This is terrible. / The meeting is at 3pm."
                className="flex-1 w-full bg-transparent border-none focus:ring-0 resize-none text-base md:text-lg text-white/90 placeholder:text-white/20 leading-relaxed font-light min-h-[120px] overflow-y-auto"
              />

              <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-white/5 gap-2">
                <span className="text-[10px] text-white/30 font-mono">
                  {text.length} characters
                </span>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative px-4 py-2 md:px-6 md:py-3 rounded-xl bg-violet-500 text-white font-semibold overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  <span className="relative flex items-center gap-2 text-sm md:text-base">
                    {isLoading ? "Classifying..." : "Classify sentiment"}
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
            </form>
          </div>
        </section>

        <section className="flex-1 lg:w-1/2 flex flex-col p-4 sm:p-6 lg:p-8 bg-[#0a0a0a]/50 lg:bg-[#0a0a0a] overflow-hidden">
          <div className="flex flex-col h-full bg-black/40 rounded-2xl md:rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="px-5 py-3 md:px-6 md:py-4 border-b border-white/5 bg-black/40 flex items-center">
              <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-white/50">
                Result
              </h2>
            </div>

            <div className="flex-1 p-5 md:p-8 overflow-y-auto flex flex-col items-center justify-center min-h-[200px]">
              {error && (
                <div className="w-full rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
                  {error.message}
                </div>
              )}

              {isLoading && (
                <Spinner />
              )}

              {!isLoading && sentiment && style && (
                <div
                  className={`flex flex-col items-center gap-4 p-8 rounded-2xl border ${style.bg}`}
                >
                  <span className="text-5xl">{style.emoji}</span>
                  <span className="text-2xl font-bold uppercase tracking-wider">
                    {style.label}
                  </span>
                  <span className="text-sm font-mono text-white/60">
                    {sentiment}
                  </span>
                </div>
              )}

              {!isLoading && !sentiment && !error && (
                <div className="flex flex-col items-center text-center space-y-3 md:space-y-4 opacity-20">
                  <span className="text-4xl">✨</span>
                  <p className="text-xs md:text-sm font-light tracking-wide italic">
                    Sentiment will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
