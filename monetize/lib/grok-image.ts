/**
 * Grok Imagine image generation (xAI).
 * https://docs.x.ai/developers/model-capabilities/imagine
 */

const GROK_BASE_URL = "https://api.x.ai/v1";

export type ImagineAspectRatio =
  | "1:1"
  | "16:9"
  | "9:16"
  | "4:3"
  | "3:4"
  | "3:2"
  | "2:3"
  | "auto";

export async function grokGenerateImage(input: {
  prompt: string;
  aspectRatio?: ImagineAspectRatio;
}): Promise<{ url: string }> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("GROK_API_KEY is not set");
  }

  const model =
    process.env.GROK_IMAGE_MODEL || "grok-imagine-image";

  const res = await fetch(`${GROK_BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt: input.prompt.slice(0, 4000),
      n: 1,
      aspect_ratio: input.aspectRatio ?? "1:1",
      response_format: "url",
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Grok Imagine error ${res.status}: ${detail.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    data?: { url?: string; b64_json?: string }[];
  };
  const url = data?.data?.[0]?.url;
  if (!url) {
    throw new Error("Grok Imagine returned no image URL");
  }
  return { url };
}
