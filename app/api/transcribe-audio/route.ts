export const maxDuration = 60;

const OPENAI_TRANSCRIPTIONS_URL = "https://api.openai.com/v1/audio/transcriptions";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") ?? formData.get("audio");

    if (!file || !(file instanceof Blob)) {
      return Response.json(
        { error: "Missing or invalid audio file. Use form field 'file' or 'audio'." },
        { status: 400 }
      );
    }

    const body = new FormData();
    body.append("file", file);
    body.append("model", "whisper-1");
    body.append("response_format", "json");

    const response = await fetch(OPENAI_TRANSCRIPTIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        response.statusText;
      return Response.json(
        { error: message || "Transcription failed" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as { text?: string };
    const text = data.text ?? "";

    return Response.json({ text });
  } catch (error) {
    console.error("Transcribe audio API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Transcription request failed",
      },
      { status: 500 }
    );
  }
}
