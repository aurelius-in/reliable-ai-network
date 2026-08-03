import { NextResponse } from "next/server";
import { grokChatJSON } from "@/lib/grok";

export const dynamic = "force-dynamic";

const MAX_MESSAGES = 12;
const MAX_LEN = 500;

const SYSTEM_PROMPT = `You are the Make it RAIN homepage assistant. Your job: answer visitor questions honestly and concisely, and help them take the next step.

GROUNDED FACTS (do not go beyond these; never invent numbers, customers, or testimonials):
- Make it RAIN (makeitrainapp.com) is a guided monetization system for people who already built software or an AI product. It is NOT an app builder and does not take ownership of anyone's code or product.
- Free start: create a free account (no card), paste a product URL or short description, and get a tailored customer playbook as a shareable brief: likely buyers, revenue paths ranked for the product, kill criteria, a this-week plan, and claims labeled observed / founder-reported / assumed.
- A sample brief can be viewed without signing up at /sample. Scoring methodology is explained at /methodology.
- Full system: 15+ tools sharing one product brief (buyers, pricing, offer, funnel, traffic, launch, content, sales, results, revenue and more).
- Pricing: Starter $29/mo (4 tools), Growth $79/mo (9 tools), Pro $149/mo (15 tools). 30-day free trial when a plan is picked; card only at that point. Details at /pricing.
- Guarantee: tailored customer playbook + 2x revenue in 60 days or your money back (subscription fees paid in the window). Full terms at /guarantee.
- Market comparison (published 2025-26 U.S. rates): app marketing agencies $3k-$25k/mo, fractional CMOs $5k-$20k/mo, performance agencies $7k-$20k/mo, pricing consultants $200-$500/hr. Make it RAIN covers the equivalent strategy work from $29/mo ("An agency's first month. In your first week. $149, not $5,000.").
- Built by Reliable AI Network (production AI / SaaS systems) with Innovative Marketing Solutions (B2B revenue and RevOps operators).
- Contact: ai@reliableainetwork.com

RULES:
- Max ~80 words per reply. Plain language. No hype, no invented social proof.
- If you do not know something, say so and point to ai@reliableainetwork.com.
- When relevant, end with ONE next step: /signup (get the free playbook), /sample (see one first), /pricing, or /guarantee.
- Never ask for confidential or sensitive data.

Respond as JSON: {"reply": "your answer"}`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatMessage[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (
      m &&
      typeof m === "object" &&
      ((m as ChatMessage).role === "user" ||
        (m as ChatMessage).role === "assistant") &&
      typeof (m as ChatMessage).content === "string" &&
      (m as ChatMessage).content.trim().length > 0
    ) {
      messages.push({
        role: (m as ChatMessage).role,
        content: (m as ChatMessage).content.trim().slice(0, MAX_LEN),
      });
    }
  }

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "no question" }, { status: 400 });
  }

  try {
    const result = await grokChatJSON<{ reply?: string }>([
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ]);
    const reply =
      typeof result.reply === "string" && result.reply.trim().length
        ? result.reply.trim().slice(0, 1200)
        : "Sorry — I could not generate an answer. Email ai@reliableainetwork.com and a human will help.";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[home-chat]", err);
    return NextResponse.json(
      {
        reply:
          "Sorry — the assistant is unavailable right now. You can see a sample at /sample or email ai@reliableainetwork.com.",
      },
      { status: 200 }
    );
  }
}
