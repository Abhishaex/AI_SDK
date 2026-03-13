import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get the last user message for the prompt
    const lastMessage = messages?.[messages.length - 1];
    const prompt = lastMessage?.parts?.find((p: any) => p.type === 'text')?.text || "";

    const result = streamText({
      model: openai("gpt-4o"), // Use a valid model for testing, gpt-5-nano might not exist
      prompt,
    });

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type === "finish" && "totalUsage" in part) {
          const u = part.totalUsage as {
            inputTokens?: number;
            outputTokens?: number;
            totalTokens?: number;
          };
          return {
            usage: {
              inputTokens: u.inputTokens ?? 0,
              outputTokens: u.outputTokens ?? 0,
              totalTokens: u.totalTokens ?? (u.inputTokens ?? 0) + (u.outputTokens ?? 0),
            },
          };
        }
      },
    });
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
