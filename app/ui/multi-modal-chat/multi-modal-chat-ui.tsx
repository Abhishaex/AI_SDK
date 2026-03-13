"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

async function convertFilesToDataURLs(
  files: File[]
): Promise<{ type: "file"; mediaType: string; url: string }[]> {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<{ type: "file"; mediaType: string; url: string }>(
          (resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                type: "file",
                mediaType: file.type,
                url: reader.result as string,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }
        )
    )
  );
}

export default function MultiModalChatUI() {
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPreviewUrls = (files: File[]) => {
    const urls = files.map((file) =>
      file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
    );
    setPendingPreviews((prev) => [...prev, ...urls]);
  };

  const revokePreviewUrl = (index: number) => {
    setPendingPreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const revokeAllPreviews = () => {
    setPendingPreviews((prev) => {
      prev.forEach((url) => url && URL.revokeObjectURL(url));
      return [];
    });
  };

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/multi-modal-chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      const newFiles = Array.from(files);
      addPreviewUrls(newFiles);
      setPendingFiles((prev) => [...prev, ...newFiles]);
    }
    e.target.value = "";
  };

  const removePendingFile = (index: number) => {
    revokePreviewUrl(index);
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && pendingFiles.length === 0) || isLoading) return;

    const fileParts =
      pendingFiles.length > 0 ? await convertFilesToDataURLs(pendingFiles) : [];

    sendMessage({
      role: "user",
      parts: [
        ...(input.trim() ? [{ type: "text" as const, text: input.trim() }] : []),
        ...fileParts,
      ],
    });

    setInput("");
    revokeAllPreviews();
    setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-md bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Image Analysis
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">
                GPT-4o · Vision
              </span>
            </div>
          </div>
        </div>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-xs font-medium hover:bg-white/10 transition-colors"
        >
          Back to Chat
        </Link>
      </header>

      <main
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar pb-10"
      >
        {error && (
          <div className="max-w-3xl mx-auto mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
            <p className="font-medium">Something went wrong</p>
            <p className="mt-1 opacity-90">{error.message}</p>
          </div>
        )}

        {(messages || []).length === 0 && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto opacity-40">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Upload an image to analyze
              </h2>
              <p className="text-sm font-light mt-2 leading-relaxed">
                Attach an image and ask questions. Describe it, extract text,
                or get insights.
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
            <div
              className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-black/20 ${
                m.role === "user"
                  ? "bg-gradient-to-br from-zinc-700 to-zinc-900"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600"
              }`}
            >
              {m.role === "user" ? "U" : "AI"}
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
                    : "bg-white/5 border-white/10 text-white/90 backdrop-blur-md shadow-xl rounded-tl-none"
                }`}
              >
                <div className="space-y-3">
                  {m.parts?.length
                    ? m.parts.map((part, i) => {
                        if (part.type === "text") {
                          const text =
                            typeof (part as { text?: string }).text === "string"
                              ? (part as { text: string }).text
                              : "";
                          return (
                            <p
                              key={i}
                              className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-light"
                            >
                              {text || "\u00a0"}
                            </p>
                          );
                        }
                        if (part.type === "file") {
                          const src =
                            "url" in part && typeof part.url === "string"
                              ? part.url
                              : "data" in part && typeof (part as { data?: string }).data === "string"
                                ? (part as { data: string }).data
                                : null;
                          if (
                            src &&
                            (part.mediaType?.startsWith("image/") ||
                              src.startsWith("data:image/"))
                          ) {
                            return (
                              <div key={i} className="rounded-xl overflow-hidden border border-white/10">
                                <img
                                  src={src}
                                  alt={`Attachment ${i + 1}`}
                                  className="max-w-full max-h-64 object-contain"
                                />
                              </div>
                            );
                          }
                        }
                        return null;
                      })
                    : m.role === "assistant" && (
                        <p className="text-sm text-white/50 font-light italic">Thinking...</p>
                      )}
                </div>
              </div>
              <div className="text-[10px] text-white/20 font-mono tracking-tighter px-2">
                {m.role === "assistant" ? "Image Analysis" : "You"}
              </div>
            </div>
          </div>
        ))}

        {isLoading &&
          messages?.[messages.length - 1]?.role !== "assistant" && (
            <div className="flex items-start gap-4 animate-in fade-in duration-300">
              <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-black/20">
                AI
              </div>
              <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl rounded-tl-none">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                </div>
              </div>
            </div>
          )}
      </main>

      <footer className="relative z-20 p-4 md:p-6 bg-[#050505] border-t border-white/5">
        {pendingFiles.length > 0 && (
          <div className="max-w-3xl mx-auto mb-3">
            <p className="text-xs text-white/50 font-medium mb-2 uppercase tracking-wider">
              Attached ({pendingFiles.length}) — will be sent with your message
            </p>
            <div className="flex flex-wrap gap-3">
              {pendingFiles.map((file, i) => (
                <div
                  key={`${file.name}-${i}-${pendingPreviews[i] ?? "pending"}`}
                  className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-lg min-w-[5rem] min-h-[5rem]"
                >
                  {pendingPreviews[i] ? (
                    <img
                      src={pendingPreviews[i]}
                      alt={file.name}
                      className="w-20 h-20 md:w-24 md:h-24 object-cover block min-w-[5rem] min-h-[5rem]"
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-white/5 min-w-[5rem] min-h-[5rem]">
                      <span className="text-[10px] text-white/40 truncate px-2 max-w-full">
                        {file.name}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removePendingFile(i)}
                    className="absolute top-1 right-1 p-1.5 rounded-full bg-black/70 text-white/90 hover:bg-red-500/90 hover:text-white transition-colors"
                    aria-label="Remove image"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 py-1 px-2 bg-black/60 text-[10px] text-white/80 truncate">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
          <div className="relative flex items-center bg-zinc-900/90 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden p-1.5">
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              title="Upload image"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </button>
            <input
              value={input ?? ""}
              onChange={handleInputChange}
              placeholder="Describe or ask about your image..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm md:text-base text-white/90 placeholder:text-white/20"
            />
            <button
              type="submit"
              disabled={
                isLoading ||
                (!(input?.trim()) && pendingFiles.length === 0)
              }
              className="p-3 rounded-xl bg-white text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:grayscale"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12 7-7 7 7" />
                <path d="M12 19V5" />
              </svg>
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center mt-3 text-white/20 font-light tracking-wide italic">
          Upload images and ask questions. Analysis is powered by GPT-4o.
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
