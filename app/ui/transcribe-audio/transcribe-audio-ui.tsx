"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Mic, Upload, FileAudio, Loader2, Copy, Check } from "lucide-react";

const ACCEPT_AUDIO = "audio/*,.mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm";

export default function TranscribeAudioUI() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (chosen) {
      setFile(chosen);
      setError(null);
      setTranscript(null);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("audio/")) {
      setFile(dropped);
      setError(null);
      setTranscript(null);
    } else if (dropped) {
      setError("Please drop an audio file (e.g. MP3, WAV, M4A).");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || isLoading) return;

    setIsLoading(true);
    setError(null);
    setTranscript(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Transcription failed");
      }

      setTranscript(typeof data.text === "string" ? data.text : "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  };

  const clearAll = () => {
    setFile(null);
    setTranscript(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white font-sans overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-md bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Mic className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Transcribe Audio
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">
                Whisper · Speech to text
              </span>
            </div>
          </div>
        </div>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-xs font-medium hover:bg-white/10 transition-colors"
        >
          Back to Dashboard
        </Link>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8 pb-10">
        <div className="max-w-2xl mx-auto space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
              <p className="font-medium">Error</p>
              <p className="mt-1 opacity-90">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200
                ${file
                  ? "border-violet-500/50 bg-violet-500/5"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_AUDIO}
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <FileAudio className="text-violet-400" size={28} />
                  </div>
                  <p className="font-medium text-white/90 truncate max-w-full">
                    {file.name}
                  </p>
                  <p className="text-xs text-white/40">
                    {(file.size / 1024).toFixed(1)} KB · Click or drop another file
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Upload className="text-white/50" size={28} />
                  </div>
                  <p className="font-medium text-white/80">
                    Drop an audio file or click to browse
                  </p>
                  <p className="text-xs text-white/40">
                    MP3, WAV, M4A, WebM, etc. · Max 25 MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!file || isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Transcribing…
                  </>
                ) : (
                  <>
                    <Mic size={18} />
                    Transcribe
                  </>
                )}
              </button>
              {(file || transcript) && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {transcript !== null && (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Transcript
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 md:p-6">
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-white/90 font-light">
                  {transcript || "\u00a0"}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
