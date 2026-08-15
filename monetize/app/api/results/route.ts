import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withProfileRepair } from "@/lib/supabase/ensure-profile";
import { grokChatJSON } from "@/lib/grok";
import {
  METRICS_OPTIMIZER_SYSTEM_PROMPT,
  buildMetricsUserPrompt,
} from "@/prompts/metrics-optimizer";
import { requireTier } from "@/lib/tool-request";
import type { MetricsAnalysis, MetricsEntry } from "@/types";
import { trackToolRun } from "@/lib/track-server";

export const maxDuration = 300;

function toCount(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

/**
 * What's Working (Pro).
 * action "log": stores one week of numbers as a generated_assets row
 *   (type "metrics_log") — no extra table needed.
 * action "analyze": runs the AI optimizer over the user's logged weeks
 *   (or inline demo entries) and stores the result as "metrics_analysis".
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const tier = await requireTier(supabase, user.id, "pro");
  if ("error" in tier) {
    return NextResponse.json({ error: tier.error }, { status: tier.status });
  }

  let body: {
    action?: "log" | "analyze";
    week_label?: string;
    visitors?: unknown;
    signups?: unknown;
    sales?: unknown;
    revenue?: unknown;
    contacted?: unknown;
    replies?: unknown;
    entries?: MetricsEntry[];
    title?: string;
    description?: string;
    type?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "log") {
    const visitors = toCount(body.visitors);
    const signups = toCount(body.signups);
    const sales = toCount(body.sales);
    const revenue = toCount(body.revenue);
    const contacted = toCount(body.contacted ?? 0);
    const replies = toCount(body.replies ?? 0);
    if (visitors === null || signups === null || sales === null || revenue === null) {
      return NextResponse.json(
        { error: "visitors, signups, sales and revenue must be numbers ≥ 0" },
        { status: 400 }
      );
    }
    if (contacted === null || replies === null) {
      return NextResponse.json(
        { error: "contacted and replies must be numbers ≥ 0" },
        { status: 400 }
      );
    }

    const entry: MetricsEntry = {
      week_label:
        body.week_label?.trim().slice(0, 60) ||
        `Week of ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      visitors,
      signups,
      sales,
      revenue,
      contacted,
      replies,
      logged_at: new Date().toISOString(),
    };

    const { data: asset, error } = await withProfileRepair(user, () =>
      supabase
        .from("generated_assets")
        .insert({
          user_id: user.id,
          creation_id: null,
          type: "metrics_log",
          content: entry,
        })
        .select("id")
        .single()
    );

    if (error) {
      console.error("Failed to save metrics entry:", error);
      return NextResponse.json(
        { error: "Could not save this week's numbers. Please try again." },
        { status: 500 }
      );
    }

    trackToolRun("results", {}, { userId: user.id, path: "/api/results" });
    return NextResponse.json({ assetId: asset.id, entry });
  }

  if (body.action === "analyze") {
    let entries: MetricsEntry[];
    if (Array.isArray(body.entries) && body.entries.length > 0) {
      // Inline entries power the "demo data" preview without persisting logs.
      entries = body.entries.slice(0, 20);
    } else {
      const { data: logs } = await supabase
        .from("generated_assets")
        .select("content")
        .eq("user_id", user.id)
        .eq("type", "metrics_log")
        .order("created_at", { ascending: true });
      entries = (logs ?? []).map(
        (row: { content: unknown }) => row.content as MetricsEntry
      );
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Log at least one week of numbers first (or try the demo data)." },
        { status: 400 }
      );
    }

    let analysis: MetricsAnalysis;
    try {
      analysis = await grokChatJSON<MetricsAnalysis>([
        { role: "system", content: METRICS_OPTIMIZER_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildMetricsUserPrompt({
            title: body.title?.trim() || "The creator's product",
            description:
              body.description?.trim() ||
              "A digital product made by a solo creator.",
            type: body.type?.trim() || "other",
            entries,
          }),
        },
      ]);
    } catch (err) {
      console.error("Metrics optimizer failed:", err);
      return NextResponse.json(
        { error: "Analysis failed. Please try again in a moment." },
        { status: 502 }
      );
    }

    const { data: asset, error: assetError } = await withProfileRepair(user, () =>
      supabase
        .from("generated_assets")
        .insert({
          user_id: user.id,
          creation_id: null,
          type: "metrics_analysis",
          content: analysis,
        })
        .select("id")
        .single()
    );

    if (assetError) {
      console.error("Failed to persist metrics analysis:", assetError);
    }

    trackToolRun("results", { action: "analyze" }, {
      userId: user.id,
      path: "/api/results",
    });
    return NextResponse.json({ assetId: asset?.id ?? null, analysis });
  }

  return NextResponse.json(
    { error: 'action must be "log" or "analyze"' },
    { status: 400 }
  );
}
