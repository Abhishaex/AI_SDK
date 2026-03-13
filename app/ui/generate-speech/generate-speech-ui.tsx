"use client";

import { useState, useRef } from "react";
import { Volume2, Download, Loader2, Play, Pause } from "lucide-react";

const VOICES = [
  { id: "alloy", label: "Alloy" },
  { id: "echo", label: "Echo" },
  { id: "fable", label: "Fable" },
  { id: "onyx", label: "Onyx" },
  { id: "nova", label: "Nova" },
  { id: "shimmer", label: "Shimmer" },
] as const;

export default function GenerateSpeechUI() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voice, setVoice] = useState<string>("alloy");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voice,
          model: "tts-1",
          speed: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to generate speech");
        return;
      }

      if (data.audio) {
        const mime = data.format === "mp3" ? "audio/mpeg" : "audio/mpeg";
        const url = `data:${mime};base64,${data.audio}`;
        setAudioUrl(url);
      } else {
        setError("No audio in response");
      }
    } catch (err) {
      console.error("Generate speech error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `speech-${Date.now()}.mp3`;
    link.click();
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
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
            <Volume2 className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Text to Speech
          </h1>
        </div>
        <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-medium tracking-widest uppercase text-white/40">
          OpenAI TTS
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 overflow-hidden">
        <section className="lg:w-[380px] flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-xl backdrop-blur-md">
            <div className="px-4 py-3 border-b border-white/5 bg-white/5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50">
                Enter text to speak
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Hello, this is a sample of text to speech..."
                rows={4}
                maxLength={4096}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-none transition-all"
                disabled={isLoading}
              />
              <div className="text-[10px] text-white/40 text-right">
                {text.length}/4096
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
                  Voice
                </label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  disabled={isLoading}
                >
                  {VOICES.map((v) => (
                    <option key={v.id} value={v.id} className="bg-zinc-900 text-white">
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={isLoading || !text.trim()}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume2 size={18} />
                    Generate Speech
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
            {audioUrl && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-xs font-medium"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-xs font-medium"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
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
                <p className="text-sm">Creating your audio...</p>
              </div>
            )}
            {!isLoading && audioUrl && (
              <div className="flex flex-col items-center gap-4 w-full max-w-md">
                <div className="w-24 h-24 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Volume2 size={40} className="text-amber-400" />
                </div>
                <p className="text-sm text-white/60 text-center">
                  Speech generated. Use Play or Download above.
                </p>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full max-w-sm h-10 rounded-lg [&::-webkit-media-controls-panel]:bg-white/10"
                />
              </div>
            )}
            {!isLoading && !audioUrl && !error && (
              <div className="flex flex-col items-center justify-center text-center text-white/30 gap-3">
                <div className="w-20 h-20 rounded-2xl border border-dashed border-white/20 flex items-center justify-center">
                  <Volume2 size={32} />
                </div>
                <p className="text-sm max-w-[240px]">
                  Enter text, pick a voice, and click Generate Speech to create
                  audio with OpenAI TTS.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
