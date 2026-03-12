import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        const { text } = await generateText({
            model: openai("gpt-5-nano"),
            prompt,
        });

        return Response.json({ text });
    } catch (error) {
        console.error("Completion API error:", error);
        return Response.json(
            { error: error instanceof Error ? error.message : "Completion failed" },
            { status: 500 }
        );
    }
}