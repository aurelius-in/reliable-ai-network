import { DFY_ASSET_OPTIONS } from "@/lib/dfy";

/** Instant creative brief the user can download while the human request queues. */
export function buildDfyInstantBrief(input: {
  assetType: string;
  productTitle: string;
  productDescription: string;
  audience: string;
  goal: string;
  tone: string;
  notes?: string;
  bestFirstTarget?: string;
  positioningLine?: string;
  sweetSpotPrice?: string;
  bigPromise?: string;
}): string {
  const option =
    DFY_ASSET_OPTIONS.find((o) => o.id === input.assetType) ??
    DFY_ASSET_OPTIONS[0];

  return [
    `# Execution brief (Layer 2 handoff)`,
    ``,
    `_Strategy and decisions live in Make it RAIN. This brief is for optional specialist execution — it does not replace your subscription tools._`,
    ``,
    `**Service:** ${option.label}`,
    `**Product:** ${input.productTitle}`,
    `**Audience:** ${input.audience}`,
    `**Goal:** ${input.goal}`,
    `**Tone:** ${input.tone}`,
    `**Requested:** ${new Date().toISOString().slice(0, 10)}`,
    ``,
    `## Product context`,
    ``,
    input.productDescription.trim() || "_Add product description in the workspace._",
    ``,
    input.bigPromise?.trim()
      ? `## Big promise\n\n${input.bigPromise.trim()}\n`
      : ``,
    input.bestFirstTarget?.trim() || input.positioningLine?.trim()
      ? [
          `## Buyer context`,
          ``,
          input.bestFirstTarget?.trim()
            ? `- Best first target: ${input.bestFirstTarget.trim()}`
            : null,
          input.positioningLine?.trim()
            ? `- Positioning: ${input.positioningLine.trim()}`
            : null,
          input.sweetSpotPrice?.trim()
            ? `- Price to reference: $${input.sweetSpotPrice.trim().replace(/^\$/, "")}`
            : null,
          ``,
        ]
          .filter(Boolean)
          .join("\n")
      : ``,
    `## What "done" looks like`,
    ``,
    option.description,
    ``,
    `## Must include`,
    ``,
    `- Clear buyer and outcome in the first screen/paragraph`,
    `- One primary CTA (no competing asks)`,
    `- Objection handling for price, timing, and “we can build this ourselves”`,
    `- Language matched to ${input.audience}`,
    `- Commercial tone: ${input.tone}`,
    `- A first-dollar path the buyer can act on this week`,
    ``,
    `## Success metric`,
    ``,
    `Aligned to: ${input.goal}`,
    ``,
    input.notes?.trim()
      ? `## Extra notes\n\n${input.notes.trim()}\n`
      : ``,
    `---`,
    ``,
    `_This execution brief is available immediately. Optional specialist delivery typically lands within 5 business days after you submit the monthly Pro request. Your subscription stays useful if you never request handoff._`,
  ]
    .filter(Boolean)
    .join("\n");
}
