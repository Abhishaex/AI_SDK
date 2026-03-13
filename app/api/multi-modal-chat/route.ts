import { convertToModelMessages, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;

/**
 * Replace data URL strings in file parts with raw base64 so the SDK doesn't
 * try to "download" them (fetch only allows http/https).
 */
function inlineDataUrls(messages: Awaited<ReturnType<typeof convertToModelMessages>>): void {
  for (const message of messages) {
    if (message.role !== "user" || !Array.isArray(message.content)) continue;
    for (const part of message.content) {
      const p = part as { type?: string; data?: string; image?: string };
      const raw = p.data ?? p.image;
      if (typeof raw !== "string" || !raw.startsWith("data:")) continue;
      const comma = raw.indexOf(",");
      if (comma === -1) continue;
      const base64 = raw.slice(comma + 1);
      if ("data" in part) (part as { data: string }).data = base64;
      if ("image" in part) (part as { image: string }).image = base64;
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body?.messages;

    if (!Array.isArray(messages)) {
      return Response.json(
        { error: "Missing or invalid messages array" },
        { status: 400 }
      );
    }

    const modelMessages = await convertToModelMessages(messages);
    inlineDataUrls(modelMessages);

    const result = streamText({
      model: openai("gpt-4o"),
      system:
        "You are a helpful AI assistant that can analyze images. When the user sends an image, describe what you see, answer questions about it, extract text if present, or analyze it in any way the user requests. Be concise but thorough.",
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Multi-modal chat API error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Multi-modal chat request failed",
      },
      { status: 500 }
    );
  }
}
