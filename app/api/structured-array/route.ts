import { streamObject } from "ai";
import { zodSchema } from "ai";
import { openai } from "@ai-sdk/openai";
import { pokemonListSchema } from "./schema";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { error: "Missing or invalid prompt" },
        { status: 400 }
      );
    }

    const result = streamObject({
      model: openai("gpt-5-nano"),
      schema: zodSchema(pokemonListSchema),
      schemaName: "PokemonList",
      schemaDescription:
        "A list of Pokémon with name, number, types, and description",
      prompt:
        prompt.trim().length > 0
          ? `Return a list of Pokémon that match this request. Use real Pokémon from the official Pokédex. Include name, national Pokédex number, types, and a short description for each.\n\nRequest: ${prompt}`
          : "Return a list of 5 popular Pokémon (e.g. Pikachu, Charizard, Mewtwo) with name, number, types, and a short description for each.",
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Structured array API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Pokémon list generation failed",
      },
      { status: 500 }
    );
  }
}
