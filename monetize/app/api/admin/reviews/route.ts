import { NextResponse } from "next/server";
import { adminKeyFromRequest, assertAdminSecret } from "@/lib/admin-auth";
import {
  MAX_FOUNDER_RESPONSE,
  MAX_REVIEW_BODY,
  MAX_REVIEW_COMPANY,
  MAX_REVIEW_NAME,
  type ProductReviewRow,
  type ReviewStatus,
} from "@/lib/reviews";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = assertAdminSecret(adminKeyFromRequest(request));
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data as ProductReviewRow[] });
}

export async function PATCH(request: Request) {
  const gate = assertAdminSecret(adminKeyFromRequest(request));
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  let id = "";
  let status: ReviewStatus | undefined;
  let displayBody: string | null | undefined;
  let founderResponse: string | null | undefined;
  let authorName: string | undefined;
  let companyName: string | undefined;

  try {
    const body = await request.json();
    id = typeof body?.id === "string" ? body.id : "";
    if (
      body?.status === "pending" ||
      body?.status === "approved" ||
      body?.status === "rejected"
    ) {
      status = body.status;
    }
    if (body?.displayBody === null) displayBody = null;
    else if (typeof body?.displayBody === "string") {
      displayBody = body.displayBody.trim().slice(0, MAX_REVIEW_BODY);
    }
    if (body?.founderResponse === null) founderResponse = null;
    else if (typeof body?.founderResponse === "string") {
      founderResponse = body.founderResponse
        .trim()
        .slice(0, MAX_FOUNDER_RESPONSE);
    }
    if (typeof body?.authorName === "string") {
      authorName = body.authorName.trim().slice(0, MAX_REVIEW_NAME);
    }
    if (typeof body?.companyName === "string") {
      companyName = body.companyName.trim().slice(0, MAX_REVIEW_COMPANY);
    }
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (status) {
    patch.status = status;
    patch.reviewed_at = new Date().toISOString();
  }
  if (displayBody !== undefined) patch.display_body = displayBody || null;
  if (founderResponse !== undefined) {
    patch.founder_response = founderResponse || null;
  }
  if (authorName !== undefined && authorName.length >= 2) {
    patch.author_name = authorName;
  }
  if (companyName !== undefined && companyName.length >= 1) {
    patch.company_name = companyName;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_reviews")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Update failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ review: data as ProductReviewRow });
}

export async function DELETE(request: Request) {
  const gate = assertAdminSecret(adminKeyFromRequest(request));
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  let id = "";
  try {
    const body = await request.json();
    id = typeof body?.id === "string" ? body.id : "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("product_reviews").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id });
}
