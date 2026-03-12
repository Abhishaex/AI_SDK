import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      prompt,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Stream API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Stream failed",
      },
      { status: 500 }
    );
  }
}
