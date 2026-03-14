"use client";

import { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { pokemonListSchema } from "@/app/api/structured-array/schema";
import type { PokemonEntry } from "@/app/api/structured-array/schema";
import { Spinner } from "../loader";

type DisplayablePokemon = Pick<PokemonEntry, "name" | "number"> & {
  types?: string[];
  description?: string;
};

/** Safely get displayable Pokémon from partial streamed object */
function getPokemonItems(list: { pokemon?: unknown[] } | undefined): DisplayablePokemon[] {
  if (!list?.pokemon || !Array.isArray(list.pokemon)) return [];
  const result: DisplayablePokemon[] = [];
  for (const p of list.pokemon) {
    if (
      p != null &&
      typeof (p as { name?: unknown }).name === "string" &&
      typeof (p as { number?: unknown }).number === "number"
    ) {
      result.push(p as DisplayablePokemon);
    }
  }
  return result;
}

export default function StructuredArrayUI() {
  const [prompt, setPrompt] = useState("");

  const { object: list, submit, isLoading, error, stop } = useObject({
    api: "/api/structured-array",
    schema: pokemonListSchema,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit({ prompt: prompt.trim() || "popular Pokémon" });
  };

  const pokemon = getPokemonItems(list);

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-sm font-bold tracking-tighter">⚡</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Pokémon List
          </h1>
        </div>
        <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-medium tracking-widest uppercase text-white/40">
          Structured array
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col-reverse lg:flex-row overflow-hidden h-[calc(100vh-80px)]">
        <section className="flex-[1.2] lg:flex-none lg:w-1/2 flex flex-col p-4 sm:p-6 lg:p-8 border-t lg:border-t-0 lg:border-r border-white/5 overflow-hidden">
          <div className="flex flex-col h-full bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="px-5 py-3 md:px-6 md:py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-white/50">
                What Pokémon?
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
                placeholder="e.g. Fire-type Pokémon, first 5 from Kanto, cute Pokémon, or leave empty for popular ones..."
                className="flex-1 w-full bg-transparent border-none focus:ring-0 resize-none text-base md:text-lg text-white/90 placeholder:text-white/20 leading-relaxed font-light min-h-[120px] overflow-y-auto"
              />

              <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-white/5 gap-2">
                <span className="text-[10px] text-white/30 font-mono">
                  {prompt.length} characters
                </span>
                <div className="flex gap-2">
                  {isLoading && (
                    <button
                      type="button"
                      onClick={stop}
                      className="px-3 py-2 rounded-xl border border-white/20 text-white/80 text-sm hover:bg-white/10"
                    >
                      Stop
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative px-4 py-2 md:px-6 md:py-3 rounded-xl bg-cyan-500 text-black font-semibold overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                    <span className="relative flex items-center gap-2 text-sm md:text-base">
                      {isLoading ? "Streaming..." : "Get Pokémon list"}
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

        <section className="flex-1 lg:w-1/2 flex flex-col p-4 sm:p-6 lg:p-8 bg-[#0a0a0a]/50 lg:bg-[#0a0a0a] overflow-hidden">
          <div className="flex flex-col h-full bg-black/40 rounded-2xl md:rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="px-5 py-3 md:px-6 md:py-4 border-b border-white/5 bg-black/40 flex items-center">
              <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-white/50">
                Pokémon list
              </h2>
            </div>

            <div className="flex-1 p-5 md:p-8 overflow-y-auto">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
                  {error.message}
                </div>
              )}

              {isLoading && (
                <Spinner />
              )}

              {(list || isLoading) && pokemon.length > 0 && (
                <ul className="space-y-4">
                  {pokemon.map((p, i) => (
                    <li
                      key={`${p.number}-${p.name}-${i}`}
                      className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5 hover:bg-white/[0.07] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-mono text-cyan-400/90">
                            #{String(p.number).padStart(3, "0")}
                          </span>
                          <h3 className="text-lg md:text-xl font-bold text-white mt-0.5">
                            {p.name}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {(Array.isArray(p.types) ? p.types : []).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-medium uppercase tracking-wide"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-white/70 text-sm leading-relaxed">
                        {typeof p.description === "string" ? p.description : "…"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {!isLoading && pokemon.length === 0 && !error && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 opacity-20 min-h-[200px]">
                  <span className="text-4xl">⚡</span>
                  <p className="text-xs md:text-sm font-light tracking-wide italic">
                    Your Pokémon list will appear here
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
