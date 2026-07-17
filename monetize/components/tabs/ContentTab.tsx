"use client";

import { useState } from "react";
import { Loader2, Megaphone } from "lucide-react";
import {
  ChipGroup,
  CopyButton,
  DownloadButton,
  ErrorText,
  FieldLabel,
  FunLoading,
  ProductPicker,
  TeachingEmptyState,
  choiceFromCreation,
  type ProductChoice,
} from "@/components/ui";
import { AUDIENCE_OPTIONS, TONE_OPTIONS } from "@/lib/examples";
import type { ContentBundle, Creation } from "@/types";

function bundleToMarkdown(bundle: ContentBundle): string {
  const lines: string[] = ["# Launch Content Bundle", ""];
  lines.push("## LinkedIn posts", "");
  bundle.linkedin_posts?.forEach((post, i) => {
    lines.push(
      `### Post ${i + 1}`,
      post.hook,
      "",
      post.body,
      "",
      post.hashtags?.map((h) => `#${h}`).join(" ") ?? "",
      ""
    );
  });
  lines.push("## X posts", "");
  bundle.x_posts?.forEach((post, i) => lines.push(`${i + 1}. ${post}`, ""));
  lines.push("## Ad variations", "");
  bundle.ad_variations?.forEach((ad) => {
    lines.push(
      `### ${ad.angle}`,
      `**${ad.headline}**`,
      "",
      ad.primary_text,
      "",
      `CTA: ${ad.cta}`,
      ""
    );
  });
  lines.push(
    `## Marketplace listing (${bundle.marketplace_listing?.platform})`,
    "",
    `**${bundle.marketplace_listing?.title}**`,
    "",
    bundle.marketplace_listing?.description ?? "",
    "",
    `Tags: ${bundle.marketplace_listing?.tags?.join(", ") ?? ""}`,
    "",
    "## Email sequence",
    ""
  );
  bundle.email_sequence?.forEach((email, i) => {
    lines.push(
      `### Email ${i + 1} — ${email.subject}`,
      `Preview: ${email.preview_text}`,
      "",
      email.body,
      ""
    );
  });
  return lines.join("\n");
}

/**
 * Tab 5 — Ad & Content Generator (Growth).
 * One idea → LinkedIn/X posts, ad variations, a marketplace listing,
 * and an email sequence — all copy-paste ready.
 */
export function ContentTab({
  creations,
  initialBundle,
}: {
  creations: Creation[];
  initialBundle: ContentBundle | null;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [tone, setTone] = useState("friendly and fun");
  const [audience, setAudience] = useState("creators");
  const [bundle, setBundle] = useState<ContentBundle | null>(initialBundle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!choice) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(choice.creationId
            ? { creationId: choice.creationId }
            : {
                title: choice.title,
                description: choice.description,
                type: choice.type,
              }),
          tone,
          audience,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Content generation failed");
      setBundle(data.bundle);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card space-y-5 p-5">
        <div>
          <h2 className="text-lg font-bold text-white">
            One idea → a week of content
          </h2>
          <p className="helper-text">
            Tap a product, pick a vibe, and get LinkedIn posts, X posts, ad
            copy, a marketplace listing, and emails — all written for you.
          </p>
        </div>

        <ProductPicker creations={creations} value={choice} onChange={setChoice} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel helper="How should the writing sound?">Vibe</FieldLabel>
            <ChipGroup
              options={TONE_OPTIONS}
              value={tone}
              onChange={setTone}
              ariaLabel="Tone"
            />
          </div>
          <div>
            <FieldLabel helper="Who are we talking to?">Audience</FieldLabel>
            <ChipGroup
              options={AUDIENCE_OPTIONS}
              value={audience}
              onChange={setAudience}
              ariaLabel="Audience"
            />
          </div>
        </div>

        <button onClick={generate} disabled={loading || !choice} className="btn-primary">
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Megaphone size={16} />
          )}
          {bundle ? "Regenerate my content" : "Generate my content"}
        </button>
        <ErrorText message={error} />
      </div>

      {loading && <FunLoading headline="Writing your content bundle…" />}

      {!loading && bundle && <ContentResult bundle={bundle} />}

      {!loading && !bundle && (
        <TeachingEmptyState
          emoji="📣"
          title="Your content bundle appears here"
          body="Everything you need to launch loud: social posts, ads, a store listing, and emails. Copy any piece with one tap."
        />
      )}
    </div>
  );
}

function ContentResult({ bundle }: { bundle: ContentBundle }) {
  return (
    <div className="fade-up space-y-6">
      <div className="flex justify-end">
        <DownloadButton
          filename="content-bundle.md"
          content={bundleToMarkdown(bundle)}
          label="Download everything"
        />
      </div>

      {/* LinkedIn */}
      <section className="card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
          💼 LinkedIn posts
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {bundle.linkedin_posts?.map((post, i) => {
            const text = `${post.hook}\n\n${post.body}\n\n${post.hashtags?.map((h) => `#${h}`).join(" ") ?? ""}`;
            return (
              <div key={i} className="rounded-xl border border-night-600 bg-night-800 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-white">{post.hook}</p>
                  <CopyButton text={text} />
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                  {post.body}
                </p>
                <p className="mt-2 text-xs font-semibold text-pink">
                  {post.hashtags?.map((h) => `#${h}`).join(" ")}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* X posts */}
      <section className="card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
          🐦 X posts
        </h3>
        <div className="mt-4 space-y-3">
          {bundle.x_posts?.map((post, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-3 rounded-xl border border-night-600 bg-night-800 p-4"
            >
              <p className="text-sm leading-relaxed text-slate-200">{post}</p>
              <CopyButton text={post} />
            </div>
          ))}
        </div>
      </section>

      {/* Ads */}
      <section className="card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
          📢 Ad variations
        </h3>
        <p className="helper-text">
          Three different angles — test them and keep the winner.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {bundle.ad_variations?.map((ad, i) => {
            const text = `${ad.headline}\n\n${ad.primary_text}\n\n[${ad.cta}]`;
            return (
              <div key={i} className="rounded-xl border border-night-600 bg-night-800 p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-bright">
                    {ad.angle}
                  </span>
                  <CopyButton text={text} />
                </div>
                <p className="mt-3 font-bold text-white">{ad.headline}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                  {ad.primary_text}
                </p>
                <p className="mt-3 text-xs font-bold text-rain-bright">
                  → {ad.cta}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Marketplace listing */}
      {bundle.marketplace_listing && (
        <section className="card p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
              🛍️ {bundle.marketplace_listing.platform} listing
            </h3>
            <CopyButton
              text={`${bundle.marketplace_listing.title}\n\n${bundle.marketplace_listing.description}`}
              label="Copy listing"
            />
          </div>
          <p className="mt-3 text-lg font-black text-white">
            {bundle.marketplace_listing.title}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">
            {bundle.marketplace_listing.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bundle.marketplace_listing.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-night-800 px-2.5 py-1 text-[11px] font-semibold text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Emails */}
      <section className="card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
          ✉️ Email sequence
        </h3>
        <p className="helper-text">
          Send one every 2 days after someone signs up or buys.
        </p>
        <div className="mt-4 space-y-3">
          {bundle.email_sequence?.map((email, i) => (
            <div key={i} className="rounded-xl border border-night-600 bg-night-800 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Email {i + 1}
                  </p>
                  <p className="font-bold text-white">{email.subject}</p>
                  <p className="text-xs text-slate-500">{email.preview_text}</p>
                </div>
                <CopyButton
                  text={`Subject: ${email.subject}\n\n${email.body}`}
                />
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                {email.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
