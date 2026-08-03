import { NextResponse } from "next/server";
import { getClientIp, hashIp } from "@/lib/client-ip";
import { notifyFoundersOfReview } from "@/lib/notify-review";
import { withSeedReviews } from "@/lib/review-seeds";
import {
  MAX_REVIEW_BODY,
  MAX_REVIEW_COMPANY,
  MAX_REVIEW_NAME,
  MIN_REVIEW_BODY,
  toPublicReview,
  type ProductReviewRow,
} from "@/lib/reviews";
import { createAdminClient } from "@/lib/supabase/admin";
import { trackServer } from "@/lib/track-server";

export const dynamic = "force-dynamic";

/** List approved reviews + this IP's pending previews (+ seeds if under 5 real). */
export async function GET(request: Request) {
  try {
    const admin = createAdminClient();
    const ipHash = hashIp(getClientIp(request));

    const { data: approved, error: approvedError } = await admin
      .from("product_reviews")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(100);

    if (approvedError) {
      console.error("[reviews] list approved:", approvedError.message);
      return NextResponse.json({
        reviews: withSeedReviews([]),
        tableReady: false,
      });
    }

    const { data: minePending } = await admin
      .from("product_reviews")
      .select("*")
      .eq("status", "pending")
      .eq("ip_hash", ipHash)
      .order("created_at", { ascending: false })
      .limit(20);

    const approvedRows = (approved ?? []) as ProductReviewRow[];
    const pendingRows = (minePending ?? []) as ProductReviewRow[];
    const pendingPublic = pendingRows.map((r) =>
      toPublicReview(r, { pendingPreview: true })
    );
    const approvedPublic = approvedRows.map((r) => toPublicReview(r));

    return NextResponse.json({
      reviews: [
        ...pendingPublic,
        ...withSeedReviews(approvedPublic, {
          creditTowardMinimum: pendingPublic.length,
        }),
      ],
      tableReady: true,
    });
  } catch (err) {
    console.error("[reviews] GET", err);
    return NextResponse.json({
      reviews: withSeedReviews([]),
      tableReady: false,
    });
  }
}

/** Submit a review (pending until founder approves). */
export async function POST(request: Request) {
  let authorName = "";
  let companyName = "";
  let body = "";
  try {
    const json = await request.json();
    authorName = typeof json?.authorName === "string" ? json.authorName : "";
    companyName =
      typeof json?.companyName === "string" ? json.companyName : "";
    body = typeof json?.body === "string" ? json.body : "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = authorName.trim().slice(0, MAX_REVIEW_NAME);
  const company = companyName.trim().slice(0, MAX_REVIEW_COMPANY);
  const text = body.trim().slice(0, MAX_REVIEW_BODY);

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Please add your first and last name." },
      { status: 400 }
    );
  }
  if (company.length < 1) {
    return NextResponse.json(
      { error: "Please add your company or app name." },
      { status: 400 }
    );
  }
  if (text.length < MIN_REVIEW_BODY) {
    return NextResponse.json(
      { error: `Please write at least ${MIN_REVIEW_BODY} characters.` },
      { status: 400 }
    );
  }

  const ipHash = hashIp(getClientIp(request));
  const userAgent = request.headers.get("user-agent")?.slice(0, 300) ?? null;

  try {
    const admin = createAdminClient();

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("product_reviews")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: "You already submitted a review recently. Thanks!" },
        { status: 429 }
      );
    }

    const { data, error } = await admin
      .from("product_reviews")
      .insert({
        author_name: name,
        company_name: company,
        body: text,
        display_body: null,
        status: "pending",
        ip_hash: ipHash,
        user_agent: userAgent,
      })
      .select("*")
      .single();

    if (error || !data) {
      console.error("[reviews] insert:", error?.message);
      return NextResponse.json(
        {
          error:
            error?.message?.includes("company_name")
              ? "Reviews database needs a quick update. Please try again shortly."
              : "Could not save your review. Please try again.",
        },
        { status: 500 }
      );
    }

    const row = data as ProductReviewRow;

    void notifyFoundersOfReview({
      id: row.id,
      authorName: name,
      companyName: company,
      body: text,
    });

    void trackServer(
      "review_submitted",
      { length: text.length },
      { path: "/api/reviews" }
    );

    return NextResponse.json({
      ok: true,
      review: toPublicReview(row, { pendingPreview: true }),
    });
  } catch (err) {
    console.error("[reviews] POST", err);
    return NextResponse.json(
      { error: "Could not save your review. Please try again." },
      { status: 500 }
    );
  }
}
