"use client";

import { useState } from "react";
import type { DishRecipe } from "@/app/api/structured-data/schema";

export default function StructuredDataUI() {
  const [prompt, setPrompt] = useState("");
  const [recipe, setRecipe] = useState<DishRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRecipe(null);
    setError(null);

    try {
      const response = await fetch("/api/structured-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() || "a classic recipe" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Request failed");
        return;
      }

      setRecipe(data.recipe);
    } catch (err) {
      console.error("Error fetching recipe:", err);
      setError("An error occurred while generating the recipe.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-sm font-bold tracking-tighter">🍳</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Recipe Generator
          </h1>
        </div>
        <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-medium tracking-widest uppercase text-white/40">
          Structured data
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col-reverse lg:flex-row overflow-hidden h-[calc(100vh-80px)]">
        <section className="flex-[1.2] lg:flex-none lg:w-1/2 flex flex-col p-4 sm:p-6 lg:p-8 border-t lg:border-t-0 lg:border-r border-white/5 overflow-hidden">
          <div className="flex flex-col h-full bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="px-5 py-3 md:px-6 md:py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-white/50">
                What to cook?
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
                placeholder="e.g. Pasta carbonara, chocolate chip cookies, or leave empty for a random classic recipe..."
                className="flex-1 w-full bg-transparent border-none focus:ring-0 resize-none text-base md:text-lg text-white/90 placeholder:text-white/20 leading-relaxed font-light custom-scrollbar min-h-[120px]"
              />

              <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-white/5">
                <span className="text-[10px] text-white/30 font-mono">
                  {prompt.length} characters
                </span>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative px-4 py-2 md:px-6 md:py-3 rounded-xl bg-amber-500 text-black font-semibold overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  <span className="relative flex items-center gap-2 text-sm md:text-base">
                    {isLoading ? "Cooking..." : "Generate recipe"}
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
                Recipe
              </h2>
            </div>

            <div className="flex-1 p-5 md:p-8 overflow-y-auto custom-scrollbar">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {isLoading && (
                <div className="flex flex-col gap-4 animate-pulse">
                  <div className="h-8 w-3/4 bg-white/5 rounded-full" />
                  <div className="h-4 w-full bg-white/5 rounded-full" />
                  <div className="h-4 w-5/6 bg-white/5 rounded-full" />
                  <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                  <div className="mt-6 h-4 w-full bg-white/5 rounded-full" />
                  <div className="h-4 w-full bg-white/5 rounded-full" />
                  <div className="h-4 w-4/5 bg-white/5 rounded-full" />
                </div>
              )}

              {!isLoading && recipe && (
                <article className="space-y-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      {recipe.name}
                    </h3>
                    {recipe.cuisine && (
                      <span className="inline-block mt-1 text-xs font-medium uppercase tracking-wider text-amber-400/90">
                        {recipe.cuisine}
                      </span>
                    )}
                    <p className="mt-2 text-white/70 text-sm md:text-base leading-relaxed">
                      {recipe.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/50">
                      <span>Prep: {recipe.prepTimeMinutes} min</span>
                      <span>Cook: {recipe.cookTimeMinutes} min</span>
                      <span>Servings: {recipe.servings}</span>
                    </div>
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {recipe.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px] uppercase tracking-wide"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-2">
                      Ingredients
                    </h4>
                    <ul className="space-y-1.5">
                      {recipe.ingredients.map((ing, i) => (
                        <li
                          key={i}
                          className="text-white/80 text-sm flex gap-2"
                        >
                          <span className="text-amber-400/80">•</span>
                          {(ing.amount || ing.unit) ? (
                            <span>
                              <span className="text-white/50">
                                {[ing.amount, ing.unit].filter(Boolean).join(" ")}{" "}
                              </span>
                              {ing.name}
                            </span>
                          ) : (
                            <span>{ing.name}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-2">
                      Instructions
                    </h4>
                    <ol className="space-y-2 list-decimal list-inside">
                      {recipe.instructions.map((step, i) => (
                        <li
                          key={i}
                          className="text-white/80 text-sm leading-relaxed pl-1"
                        >
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              )}

              {!isLoading && !recipe && !error && (
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
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                    <line x1="6" y1="1" x2="6" y2="4" />
                    <line x1="10" y1="1" x2="10" y2="4" />
                    <line x1="14" y1="1" x2="14" y2="4" />
                  </svg>
                  <p className="text-xs md:text-sm font-light tracking-wide italic">
                    Your generated recipe will appear here
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
