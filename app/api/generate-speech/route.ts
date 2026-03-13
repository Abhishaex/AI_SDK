export const maxDuration = 60;

const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
type Voice = (typeof VOICES)[number];

function isVoice(v: unknown): v is Voice {
  return typeof v === "string" && VOICES.includes(v as Voice);
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const text = body?.text ?? body?.input;
    const voice = body?.voice ?? "alloy";
    const model = body?.model ?? "tts-1";
    const speed = body?.speed ?? 1;

    if (typeof text !== "string" || !text.trim()) {
      return Response.json(
        { error: "Missing or invalid text" },
        { status: 400 }
      );
    }

    if (text.length > 4096) {
      return Response.json(
        { error: "Text must be 4096 characters or less" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model === "tts-1-hd" ? "tts-1-hd" : "tts-1",
        input: text.trim(),
        voice: isVoice(voice) ? voice : "alloy",
        speed: typeof speed === "number" ? Math.min(4, Math.max(0.25, speed)) : 1,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        response.statusText;
      return Response.json(
        { error: message || "Speech generation failed" },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return Response.json({ audio: base64, format: "mp3" });
  } catch (error) {
    console.error("Generate speech API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Speech generation failed",
      },
      { status: 500 }
    );
  }
}
