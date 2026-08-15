import { after, NextResponse } from "next/server";
import { assertAdminSecret, adminKeyFromRequest } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchPublicWebsiteContext } from "@/lib/website-public";
import {
  buildSharedReportPayload,
  newShareToken,
} from "@/lib/shared-report";
import type { ProductContext } from "@/lib/product-context";
import {
  buildProductBlurb,
  cleanWebsiteExcerpt,
} from "@/lib/clean-website-excerpt";
import { runFounderBriefGeneration } from "@/lib/run-founder-brief";
import {
  toFounderFacingScore,
  toFounderFacingSurvival,
} from "@/lib/founder-facing-score";

export const maxDuration = 300;

/**
 * Founder-only: scrape URL, create /r/{token} immediately (status=generating),
 * finish Analyzer + Stress Test + extras in the background via after().
 *
 * Client should poll GET /api/reports/[token] until payload.status === "ready".
 */
export async function POST(request: Request) {
  const gate = assertAdminSecret(adminKeyFromRequest(request));
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  let body: {
    url?: string;
    productName?: string;
    founderName?: string;
    traction?: string;
    stage?: string;
    price?: string;
    ownerEmail?: string;
    coverNote?: string;
    audience?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const productUrl = body.url?.trim();
  if (!productUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const founderName = (body.founderName || "Founder").trim();
  const stage = (body.stage || "launched").trim();
  const current_price =
    body.price?.trim() || "Free / freemium (details from site)";
  const traction =
    body.traction?.trim() ||
    "Founder-reported: free users; no paying customers yet.";
  const audience = body.audience?.trim() || "";

  let website_context;
  try {
    website_context = await fetchPublicWebsiteContext(productUrl);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not scrape product URL",
      },
      { status: 400 }
    );
  }

  const cleanedExcerpt = cleanWebsiteExcerpt(
    website_context.text_excerpt || "",
    1200
  );
  website_context = {
    ...website_context,
    text_excerpt: cleanedExcerpt,
    char_count: cleanedExcerpt.length,
  };

  const productName =
    (body.productName || "").trim() ||
    website_context.title?.replace(/\s*[|:-].*$/, "").trim() ||
    "Product";

  const product_blurb = buildProductBlurb({
    meta: website_context.meta_description,
    title: website_context.title,
    excerpt: cleanedExcerpt,
    fallback: `${productName}: product site reviewed for First Customer Path.`,
  });

  const product: ProductContext = {
    title: productName,
    description: product_blurb,
    type: "saas",
    stage,
    traction,
    current_price,
    product_url: productUrl,
    website_context,
  };

  const cover_note =
    body.coverNote?.trim() ||
    `Prepared for ${founderName}. First Customer Path on ${productName}: who may pay, paid wedge, stress test before outreach.`;

  const pendingPayload = buildSharedReportPayload({
    product,
    cover_note,
    product_blurb,
    status: "generating",
  });

  const admin = createAdminClient();
  const ownerEmail = (
    body.ownerEmail ||
    process.env.ADMIN_NOTIFY_EMAIL ||
    "ai@reliableainetwork.com"
  ).trim();

  let userId = process.env.FOUNDER_USER_ID?.trim() || "";
  if (!userId) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, email")
      .ilike("email", ownerEmail)
      .limit(1);
    userId = profiles?.[0]?.id || "";
  }
  if (!userId) {
    const { data: listed } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    const hit = listed?.users?.find(
      (u) => (u.email || "").toLowerCase() === ownerEmail.toLowerCase()
    );
    userId =
      hit?.id ||
      listed?.users?.find((u) =>
        /reliableainetwork|makeitrain/i.test(u.email || "")
      )?.id ||
      "";
  }
  if (!userId) {
    return NextResponse.json(
      { error: "Could not resolve owner user_id for shared_reports" },
      { status: 500 }
    );
  }

  const token = newShareToken();
  const title = `First Customer Path: ${productName} (for ${founderName})`;

  const { data, error } = await admin
    .from("shared_reports")
    .insert({
      user_id: userId,
      token,
      title,
      payload: pendingPayload,
    })
    .select("id, token, created_at")
    .single();

  if (error || !data) {
    console.error("founder-brief insert failed:", error);
    return NextResponse.json(
      { error: error?.message || "Could not save shared brief" },
      { status: 500 }
    );
  }

  const reportId = data.id;
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://makeitrainapp.com";
  const shareUrl = `${origin}/r/${data.token}`.replace(
    /MakeItRainApp\.com/i,
    "makeitrainapp.com"
  );

  after(async () => {
    try {
      const ready = await runFounderBriefGeneration({
        product,
        product_blurb,
        cover_note,
        audience,
        current_price,
      });
      const admin2 = createAdminClient();
      const { error: upErr } = await admin2
        .from("shared_reports")
        .update({ payload: ready })
        .eq("id", reportId);
      if (upErr) {
        console.error("founder-brief background update failed:", upErr);
        await admin2
          .from("shared_reports")
          .update({
            payload: {
              ...pendingPayload,
              status: "failed",
              error: upErr.message || "Could not save finished brief",
            },
          })
          .eq("id", reportId);
      }
    } catch (err) {
      console.error("founder-brief background failed:", err);
      try {
        const admin2 = createAdminClient();
        await admin2
          .from("shared_reports")
          .update({
            payload: {
              ...pendingPayload,
              status: "failed",
              error:
                err instanceof Error
                  ? err.message
                  : "Brief generation failed",
            },
          })
          .eq("id", reportId);
      } catch (e2) {
        console.error("founder-brief failed-status write failed:", e2);
      }
    }
  });

  return NextResponse.json({
    shareUrl,
    token: data.token,
    id: data.id,
    title,
    status: "generating",
    message:
      "Brief page created. Analyzer + Stress Test are running in the background (about 2-3 minutes). Poll until ready.",
    summary: null,
  });
}

/** Poll generation status for a token (admin). */
export async function GET(request: Request) {
  const gate = assertAdminSecret(adminKeyFromRequest(request));
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const token = new URL(request.url).searchParams.get("token")?.trim();
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("shared_reports")
    .select("id, token, title, payload, created_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const payload = data.payload as {
    status?: string;
    error?: string;
    analysis?: { score?: number; confidence?: string; commercial_answer?: { primary_buyer?: string; smallest_paid_offer?: string }; big_promise?: string };
    stress_test?: {
      verdict?: string;
      survival_score?: number;
      verdict_line?: string;
      offer_rewrite?: { who_may_pay?: string };
      dm_opener_after_test?: string;
    };
  };
  const status = payload.status || "ready";
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://makeitrainapp.com";
  const shareUrl = `${origin}/r/${data.token}`.replace(
    /MakeItRainApp\.com/i,
    "makeitrainapp.com"
  );

  const analysis = payload.analysis;
  const stress = payload.stress_test;
  const facing = analysis?.score != null ? toFounderFacingScore(analysis.score) : null;

  return NextResponse.json({
    shareUrl,
    token: data.token,
    id: data.id,
    title: data.title,
    status,
    error: payload.error || null,
    summary:
      status === "ready" && analysis
        ? {
            score: facing?.display ?? analysis.score,
            confidence: analysis.confidence,
            readiness_label: facing?.label,
            primary_buyer: analysis.commercial_answer?.primary_buyer,
            smallest_paid_offer: analysis.commercial_answer?.smallest_paid_offer,
            big_promise: analysis.big_promise,
            stress_verdict: stress?.verdict,
            survival_score: stress?.survival_score != null
              ? toFounderFacingSurvival(stress.survival_score)
              : undefined,
            verdict_line: stress?.verdict_line,
            who_may_pay: stress?.offer_rewrite?.who_may_pay,
            dm_opener: stress?.dm_opener_after_test,
          }
        : null,
  });
}
