import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const SENTIMENTS = ["positive", "negative", "neutral"] as const;
type Sentiment = (typeof SENTIMENTS)[number];

function normalizeSentiment(text: string): Sentiment {
  const word = text.trim().toLowerCase();
  const found = SENTIMENTS.find((s) => word === s || word.startsWith(s));
  return found ?? "neutral";
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { error: "Missing or invalid prompt" },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: openai("gpt-5-nano"),
      prompt: `Classify the sentiment of the following text. Reply with exactly one word: positive, negative, or neutral.\n\nText: ${prompt.trim()}`,
    });

    const sentiment = normalizeSentiment(text);
    return Response.json({ object: { sentiment } });
  } catch (error) {
    console.error("Structured enum API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Sentiment classification failed",
      },
      { status: 500 }
    );
  }
}
