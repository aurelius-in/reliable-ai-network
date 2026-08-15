"use client";

import { useMemo, useState } from "react";
import { ImageIcon, Loader2, Megaphone } from "lucide-react";
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
import { OutputCaveat } from "@/components/OutputCaveat";
import { AUDIENCE_OPTIONS, TONE_OPTIONS } from "@/lib/examples";
import { AD_NETWORKS, getAdNetwork } from "@/lib/ad-networks";
import { defaultAudienceFromBuyers } from "@/lib/tool-defaults";
import type {
  AdPosterResult,
  BuyerProfilesResult,
  ContentBundle,
  Creation,
  IdeaAnalysis,
} from "@/types";

const DEFAULT_NETWORKS = ["linkedin", "x", "instagram"];

function bundleToMarkdown(bundle: ContentBundle): string {
  const lines: string[] = ["# Launch Content Bundle", ""];
  if (bundle.this_week_publish?.length) {
    lines.push("## This-week publish order", "");
    for (const d of bundle.this_week_publish) {
      lines.push(
        `### ${d.day} — ${d.channel}`,
        "",
        d.asset,
        "",
        d.copy_paste,
        ""
      );
    }
  }
  if (bundle.network_posts?.length) {
    lines.push("## Network posts", "");
    for (const post of bundle.network_posts) {
      lines.push(
        `### ${post.network} (${post.mode} · ${post.format})`,
        post.hook,
        "",
        post.body,
        "",
        post.cta ? `CTA: ${post.cta}` : "",
        post.hashtags?.map((h) => `#${h}`).join(" ") ?? "",
        ""
      );
    }
  }
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
      `### ${ad.angle}${ad.network ? ` · ${ad.network}` : ""}`,
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
    "## Newsletter sequence",
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

function toggleNetwork(selected: string[], id: string): string[] {
  if (selected.includes(id)) {
    return selected.filter((x) => x !== id);
  }
  if (selected.length >= 6) return selected;
  return [...selected, id];
}

/**
 * Tab — Post Writer + Newsletter Writer + Ad Poster (Growth).
 */
export function ContentTab({
  creations,
  initialBundle,
  initialAnalyses = {},
  initialBuyers = null,
}: {
  creations: Creation[];
  initialBundle: ContentBundle | null;
  initialAnalyses?: Record<string, IdeaAnalysis>;
  initialBuyers?: BuyerProfilesResult | null;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [tone, setTone] = useState("direct and executive");
  const [audience, setAudience] = useState(() =>
    defaultAudienceFromBuyers(initialBuyers)
  );
  const [networks, setNetworks] = useState<string[]>(DEFAULT_NETWORKS);
  const [bundle, setBundle] = useState<ContentBundle | null>(initialBundle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seed = useMemo(() => {
    const analysis = choice?.creationId
      ? initialAnalyses[choice.creationId]
      : undefined;
    const persona = initialBuyers?.personas?.[0];
    return {
      bigPromise: analysis?.big_promise,
      positioningLine: persona?.positioning_line,
    };
  }, [choice, initialAnalyses, initialBuyers]);

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
          networks,
          bigPromise: seed.bigPromise,
          positioningLine: seed.positioningLine,
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
      <div className="rounded-2xl border border-rain/40 bg-gradient-to-br from-rain/15 via-night-800 to-night-800 p-5 sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-rain-bright">
          Post Writer · Newsletter Writer · Ad Poster
        </p>
        <h2 className="mt-1.5 text-xl font-black text-white sm:text-2xl">
          Write for the networks you already use
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Organic posts and paid ads tailored to LinkedIn, Meta, X, YouTube,
          TikTok, Reddit, Google Ads, and more — personalized to{" "}
          <span className="font-semibold text-white">your</span> product. Plus
          ad posters sized for each placement.
        </p>
      </div>

      <NetworkDirectory />

      <div className="card space-y-5 p-5">
        <div>
          <h2 className="text-lg font-bold text-white">
            Write posts + newsletter for your networks
          </h2>
          <p className="helper-text">
            Pick up to 6 networks. Post Writer drafts network-native copy;
            Newsletter Writer builds a 3-email sequence. Ads match paid products
            people recognize (Sponsored Content, Meta Ads, etc.).
          </p>
        </div>

        <ProductPicker creations={creations} value={choice} onChange={setChoice} />

        <div>
          <FieldLabel helper="Tap to select. Organic + paid where the network supports it.">
            Networks (up to 6)
          </FieldLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {AD_NETWORKS.map((n) => {
              const on = networks.includes(n.id);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setNetworks((prev) => toggleNetwork(prev, n.id))}
                  className={`chip ${on ? "chip-on" : ""}`}
                  title={n.blurb}
                >
                  {n.label}
                  {n.paid && n.organic ? (
                    <span className="ml-1 text-[9px] opacity-70">O+P</span>
                  ) : n.paid ? (
                    <span className="ml-1 text-[9px] opacity-70">Paid</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            O+P = organic and paid. Selected:{" "}
            {networks.map((id) => getAdNetwork(id)?.label ?? id).join(", ") ||
              "none"}
          </p>
        </div>

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

        <button
          onClick={generate}
          disabled={loading || !choice || networks.length === 0}
          className="btn-primary"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Megaphone size={16} />
          )}
          {bundle ? "Rewrite for these networks" : "Write for these networks"}
        </button>
        <ErrorText message={error} />
      </div>

      <AdPosterPanel
        choice={choice}
        audience={audience}
        tone={tone}
        bigPromise={seed.bigPromise}
        defaultNetworkId={networks[0] ?? "linkedin"}
      />

      {loading && <FunLoading headline="Writing network-native drafts…" />}

      {!loading && bundle && <ContentResult bundle={bundle} />}

      {!loading && !bundle && (
        <TeachingEmptyState
          emoji="📣"
          title="Your network drafts appear here"
          body="Pick the networks you already advertise on. Get posts, paid ad copy, newsletter emails, and generate ad posters sized for each placement."
        />
      )}
    </div>
  );
}

function NetworkDirectory() {
  return (
    <details className="card group open:border-rain/30">
      <summary className="cursor-pointer list-none px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              Where people advertise
            </p>
            <p className="mt-0.5 text-sm font-bold text-white">
              All networks we tailor for — organic and paid
            </p>
          </div>
          <span className="shrink-0 text-rain-bright transition group-open:rotate-45">
            +
          </span>
        </div>
      </summary>
      <div className="border-t border-night-600 px-5 pb-5 pt-3">
        <ul className="grid gap-2 sm:grid-cols-2">
          {AD_NETWORKS.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-night-600 bg-night-800/60 px-3 py-2.5"
            >
              <p className="text-sm font-bold text-white">{n.label}</p>
              <p className="mt-0.5 text-xs text-slate-400">{n.blurb}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {n.organic ? "Organic" : ""}
                {n.organic && n.paid ? " · " : ""}
                {n.paid ? `Paid: ${n.paidProducts.slice(0, 2).join(", ")}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

function AdPosterPanel({
  choice,
  audience,
  tone,
  bigPromise,
  defaultNetworkId,
}: {
  choice: ProductChoice | null;
  audience: string;
  tone: string;
  bigPromise?: string;
  defaultNetworkId: string;
}) {
  const [networkId, setNetworkId] = useState(defaultNetworkId);
  const network = getAdNetwork(networkId) ?? AD_NETWORKS[0];
  const [placementId, setPlacementId] = useState(network.placements[0]?.id ?? "");
  const [poster, setPoster] = useState<AdPosterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placement =
    network.placements.find((p) => p.id === placementId) ??
    network.placements[0];

  function onNetworkChange(id: string) {
    setNetworkId(id);
    const n = getAdNetwork(id);
    setPlacementId(n?.placements[0]?.id ?? "");
  }

  async function generatePoster() {
    if (!choice || !placement) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ad-poster", {
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
          networkId,
          placementId: placement.id,
          audience,
          tone,
          bigPromise,
          generateImage: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ad poster failed");
      setPoster(data.poster);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-5 p-5">
      <div>
        <h2 className="text-lg font-bold text-white">Ad Poster</h2>
        <p className="helper-text">
          Generate a poster sized for a real placement — Feed, Stories, Shorts,
          Display — with caption copy personalized to your product.
        </p>
      </div>

      <div>
        <FieldLabel>Network</FieldLabel>
        <ChipGroup
          options={AD_NETWORKS.filter((n) => n.tools.includes("ad_poster")).map(
            (n) => ({ value: n.id, label: n.label })
          )}
          value={networkId}
          onChange={onNetworkChange}
          ariaLabel="Poster network"
        />
      </div>

      {network.placements.length > 0 && (
        <div>
          <FieldLabel helper={network.blurb}>Placement</FieldLabel>
          <ChipGroup
            options={network.placements.map((p) => ({
              value: p.id,
              label: `${p.label} (${p.aspectRatio})`,
            }))}
            value={placement?.id ?? ""}
            onChange={setPlacementId}
            ariaLabel="Placement"
          />
        </div>
      )}

      <button
        onClick={generatePoster}
        disabled={loading || !choice}
        className="btn-primary"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ImageIcon size={16} />
        )}
        {poster ? "Regenerate ad poster" : "Generate ad poster"}
      </button>
      <ErrorText message={error} />

      {loading && <FunLoading headline="Designing your ad poster…" />}

      {!loading && poster && (
        <div className="space-y-4 rounded-xl border border-night-600 bg-night-800/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-white">
              {poster.network_label} · {poster.placement_label}
            </p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {poster.aspect_ratio}
              {poster.paid ? " · paid" : " · organic"}
            </span>
          </div>
          {poster.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster.image_url}
              alt={`${poster.headline} ad poster`}
              className="mx-auto max-h-[420px] w-full max-w-md rounded-lg border border-night-600 object-contain"
            />
          ) : (
            <p className="text-sm text-amber-300/90">
              Copy ready
              {poster.image_error
                ? ` — image skipped (${poster.image_error})`
                : " — image unavailable"}
              . Use the visual prompt below in any design tool.
            </p>
          )}
          <div>
            <p className="text-lg font-black text-white">{poster.headline}</p>
            {poster.subhead && (
              <p className="mt-1 text-sm text-slate-300">{poster.subhead}</p>
            )}
            {poster.cta && (
              <p className="mt-2 text-xs font-bold text-rain-bright">
                → {poster.cta}
              </p>
            )}
          </div>
          {poster.primary_text && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Caption / primary text
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-300">
                {poster.primary_text}
              </p>
              <div className="mt-2">
                <CopyButton text={poster.primary_text} label="Copy caption" />
              </div>
            </div>
          )}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Visual prompt
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {poster.visual_prompt}
            </p>
            <div className="mt-2">
              <CopyButton text={poster.visual_prompt} label="Copy prompt" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentResult({ bundle }: { bundle: ContentBundle }) {
  const sprint = bundle.this_week_publish ?? [];
  const networkPosts = bundle.network_posts ?? [];
  return (
    <div className="fade-up space-y-6">
      <OutputCaveat tool="content" />
      <div className="flex justify-end">
        <DownloadButton
          filename="content-bundle.md"
          content={bundleToMarkdown(bundle)}
          label="Download everything"
        />
      </div>

      {sprint.length > 0 && (
        <section className="rounded-2xl border border-aqua/30 bg-aqua/5 p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-aqua">
            This-week publish order
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Five days. Ship one asset per day. No blank calendar.
          </p>
          <div className="mt-4 space-y-3">
            {sprint.map((day, i) => (
              <div
                key={i}
                className="rounded-xl border border-night-600 bg-night-800/80 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-white">
                    {day.day} · {day.channel}
                  </p>
                  <CopyButton text={day.copy_paste} label="Copy" />
                </div>
                <p className="mt-1 text-xs text-slate-400">{day.asset}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                  {day.copy_paste}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {networkPosts.length > 0 && (
        <section className="card p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
            Post Writer · your networks
          </h3>
          <p className="helper-text">
            Tailored to each network&apos;s norms — organic or paid.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {networkPosts.map((post, i) => {
              const text = [
                post.hook,
                "",
                post.body,
                post.cta ? `\n${post.cta}` : "",
                post.hashtags?.length
                  ? `\n${post.hashtags.map((h) => `#${h}`).join(" ")}`
                  : "",
              ].join("\n");
              return (
                <div
                  key={i}
                  className="rounded-xl border border-night-600 bg-night-800 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-rain/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rain-bright">
                      {post.network}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {post.mode} · {post.format}
                    </span>
                  </div>
                  <p className="mt-3 font-bold text-white">{post.hook}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                    {post.body}
                  </p>
                  {post.cta && (
                    <p className="mt-2 text-xs font-bold text-rain-bright">
                      → {post.cta}
                    </p>
                  )}
                  <div className="mt-3">
                    <CopyButton text={text} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
          Post Writer · LinkedIn
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {bundle.linkedin_posts?.map((post, i) => {
            const text = `${post.hook}\n\n${post.body}\n\n${post.hashtags?.map((h) => `#${h}`).join(" ") ?? ""}`;
            return (
              <div key={i} className="rounded-xl border border-night-600 bg-night-800 p-4">
                <p className="font-bold text-white">{post.hook}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                  {post.body}
                </p>
                <p className="mt-2 text-xs font-semibold text-pink">
                  {post.hashtags?.map((h) => `#${h}`).join(" ")}
                </p>
                <div className="mt-3">
                  <CopyButton text={text} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
          Post Writer · X
        </h3>
        <div className="mt-4 space-y-3">
          {bundle.x_posts?.map((post, i) => (
            <div
              key={i}
              className="rounded-xl border border-night-600 bg-night-800 p-4"
            >
              <p className="text-sm leading-relaxed text-slate-200">{post}</p>
              <div className="mt-3">
                <CopyButton text={post} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
          Paid ad copy
        </h3>
        <p className="helper-text">
          Angles sized for the networks you advertise on — test and keep the
          winner.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {bundle.ad_variations?.map((ad, i) => {
            const text = `${ad.headline}\n\n${ad.primary_text}\n\n[${ad.cta}]`;
            return (
              <div key={i} className="rounded-xl border border-night-600 bg-night-800 p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-bright">
                    {ad.angle}
                    {ad.network ? ` · ${ad.network}` : ""}
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

      {bundle.marketplace_listing && (
        <section className="card p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
              {bundle.marketplace_listing.platform} listing
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

      <section className="card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
          Newsletter Writer
        </h3>
        <p className="helper-text">
          Three emails personalized to your product — feels 1:1, not a blast.
        </p>
        <div className="mt-4 space-y-3">
          {bundle.email_sequence?.map((email, i) => (
            <div key={i} className="rounded-xl border border-night-600 bg-night-800 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Email {i + 1}
              </p>
              <p className="font-bold text-white">{email.subject}</p>
              <p className="text-xs text-slate-500">{email.preview_text}</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                {email.body}
              </p>
              <div className="mt-3">
                <CopyButton
                  text={`Subject: ${email.subject}\n\n${email.body}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
