import { convertToModelMessages, streamText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import type { UIMessage } from "ai";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: openai("gpt-5-nano"),
      system: `You are a helpful assistant with access to web search.

When the user asks about current events, news, recent developments, or any information that may change over time, use the web_search_preview tool to find up-to-date information.
Synthesize the search results into a clear, accurate response. Cite sources when relevant.`,
      messages: await convertToModelMessages(messages),
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: "medium",
        }),
      },
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
    console.error("Web search tool API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Web search chat failed",
      },
      { status: 500 }
    );
  }
}
