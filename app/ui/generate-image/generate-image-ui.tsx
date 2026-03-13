"use client";

import { useState } from "react";
import { ImageIcon, Download, Loader2 } from "lucide-react";

export default function GenerateImageUI() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to generate image");
        return;
      }

      if (data.url) {
        setImageUrl(data.url);
      } else {
        setError("No image URL in response");
      }
    } catch (err) {
      console.error("Generate image error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `dall-e-${Date.now()}.png`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[100px] rounded-full" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/5 backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ImageIcon className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            DALL·E Image Generator
          </h1>
        </div>
        <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-medium tracking-widest uppercase text-white/40">
          1024×1024
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 overflow-hidden">
        <section className="lg:w-[380px] flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-xl backdrop-blur-md">
            <div className="px-4 py-3 border-b border-white/5 bg-white/5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50">
                Describe your image
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. A serene mountain lake at sunset with pine trees..."
                rows={4}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-none transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon size={18} />
                    Generate Image
                  </>
                )}
              </button>
            </form>
          </div>
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </section>

        <section className="flex-1 min-h-0 flex flex-col bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-xl backdrop-blur-md">
          <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Result
            </h2>
            {imageUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-xs font-medium"
              >
                <Download size={14} />
                Download
              </button>
            )}
          </div>
          <div className="flex-1 p-4 sm:p-6 flex items-center justify-center min-h-[320px] overflow-auto">
            {isLoading && (
              <div className="flex flex-col items-center gap-4 text-white/50">
                <div className="w-16 h-16 rounded-2xl bg-white/10 animate-pulse" />
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500/60 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-amber-500/60 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-amber-500/60 animate-bounce [animation-delay:300ms]" />
                </div>
                <p className="text-sm">Creating your image...</p>
              </div>
            )}
            {!isLoading && imageUrl && (
              <div className="relative w-full max-w-[1024px]">
                <img
                  src={imageUrl}
                  alt={prompt.slice(0, 100)}
                  className="w-full h-auto rounded-xl border border-white/10 shadow-2xl"
                />
              </div>
            )}
            {!isLoading && !imageUrl && !error && (
              <div className="flex flex-col items-center justify-center text-center text-white/30 gap-3">
                <div className="w-20 h-20 rounded-2xl border border-dashed border-white/20 flex items-center justify-center">
                  <ImageIcon size={32} />
                </div>
                <p className="text-sm max-w-[240px]">
                  Enter a prompt and click Generate to create an image with
                  DALL·E (1024×1024).
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
