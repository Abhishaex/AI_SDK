import { convertToModelMessages, streamText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import type { UIMessage } from "ai";
import { multipleTools } from "./tools";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: openai("gpt-4o"),
      system: `You are a helpful assistant with access to multiple tools.

For weather: When the user asks about weather without specifying a city (e.g. "here", "my city", "where I am"), check the conversation. If they've stated their city earlier (e.g. "I'm in Mumbai", "My city is London"), use that city for the weather tool. If not, ask them to specify which city.

Tools: weather, calculator, getCurrentDateTime, randomNumber, joke. Use them when relevant.`,
      messages: await convertToModelMessages(messages),
      tools: multipleTools,
      stopWhen: stepCountIs(8),
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
    console.error("Multiple tools API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Multiple tools chat failed",
      },
      { status: 500 }
    );
  }
}
