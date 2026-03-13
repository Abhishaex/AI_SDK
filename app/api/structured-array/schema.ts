import { z } from "zod";

/** Single Pokémon entry for structured AI output. */
export const pokemonEntrySchema = z.object({
  name: z.string().describe("Pokémon name"),
  number: z.number().min(1).describe("National Pokédex number"),
  types: z
    .array(z.string())
    .min(1)
    .describe("Primary type(s), e.g. Fire, Water, Grass"),
  description: z.string().describe("Short description of the Pokémon"),
});

/** List of Pokémon returned from a user prompt (e.g. by type, theme, or count). */
export const pokemonListSchema = z.object({
  pokemon: z
    .array(pokemonEntrySchema)
    .min(1)
    .describe("List of Pokémon matching the user's request"),
});

export type PokemonEntry = z.infer<typeof pokemonEntrySchema>;
export type PokemonList = z.infer<typeof pokemonListSchema>;
