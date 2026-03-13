import { convertToModelMessages, streamText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import type { UIMessage } from "ai";
import { chatTools } from "../tools";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: openai("gpt-4o"),
      system:
        "You are a helpful assistant. Use the available tools when relevant: weather, calculator, or getCurrentDateTime. Call tools when the user asks about weather, math calculations, or the current date/time.",
      messages: await convertToModelMessages(messages),
      tools: chatTools,
      stopWhen: stepCountIs(5),
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
    console.error("Chat with tools API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Chat with tools failed",
      },
      { status: 500 }
    );
  }
}
