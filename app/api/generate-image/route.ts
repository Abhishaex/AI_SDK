export const maxDuration = 60;

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
    const prompt = body?.prompt;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return Response.json(
        { error: "Missing or invalid prompt" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt.trim(),
        n: 1,
        size: "1024x1024",
        response_format: "url",
        quality: "standard",
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        response.statusText;
      return Response.json(
        { error: message || "Image generation failed" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as {
      data?: Array<{ url?: string; b64_json?: string }>;
    };
    const image = data.data?.[0];

    if (!image?.url) {
      return Response.json(
        { error: "No image URL in response" },
        { status: 500 }
      );
    }

    return Response.json({ url: image.url });
  } catch (error) {
    console.error("Generate image API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Image generation failed",
      },
      { status: 500 }
    );
  }
}
