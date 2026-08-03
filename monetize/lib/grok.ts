/**
 * Minimal Grok (xAI) client using the OpenAI-compatible
 * chat completions endpoint at https://api.x.ai/v1.
 */

import { RIGOR_SYSTEM_ADDENDUM } from "@/prompts/rigor";

const GROK_BASE_URL = "https://api.x.ai/v1";

interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function withRigor(messages: GrokMessage[]): GrokMessage[] {
  return messages.map((m) =>
    m.role === "system"
      ? { ...m, content: `${m.content}\n\n${RIGOR_SYSTEM_ADDENDUM}` }
      : m
  );
}

export async function grokChatJSON<T>(messages: GrokMessage[]): Promise<T> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("GROK_API_KEY is not set");
  }

  const model = process.env.GROK_MODEL || "grok-4.5";

  const res = await fetch(`${GROK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: withRigor(messages),
      temperature: 0.6,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Grok API error ${res.status}: ${detail.slice(0, 500)}`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Grok API returned an empty response");
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    // Some models wrap JSON in code fences despite json_object mode.
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw new Error("Grok API response was not valid JSON");
  }
}
