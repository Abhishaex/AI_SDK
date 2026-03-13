import { streamObject } from "ai";
import { zodSchema } from "ai";
import { openai } from "@ai-sdk/openai";
import { dishRecipeSchema } from "./schema";

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
      schema: zodSchema(dishRecipeSchema),
      schemaName: "DishRecipe",
      schemaDescription: "A structured recipe for a dish with ingredients and instructions",
      prompt:
        prompt.trim().length > 0
          ? `Generate a complete recipe for the following dish or request. Return a single recipe that matches the request.\n\nRequest: ${prompt}`
          : "Generate a classic, well-known recipe (e.g. spaghetti carbonara, chocolate chip cookies).",
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Structured data API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Recipe generation failed",
      },
      { status: 500 }
    );
  }
}
