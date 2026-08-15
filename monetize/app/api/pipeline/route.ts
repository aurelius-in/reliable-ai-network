import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  PIPELINE_ASSET_TYPE,
  PIPELINE_STAGES,
  newContactId,
} from "@/lib/pipeline";
import { requireTier } from "@/lib/tool-request";
import { trackToolRun } from "@/lib/track-server";
import type { PipelineBoard, PipelineContact, PipelineStage } from "@/types";

export const maxDuration = 60;

const STAGE_IDS = new Set(PIPELINE_STAGES.map((s) => s.id));

function emptyBoard(): PipelineBoard {
  return { contacts: [], updated_at: new Date().toISOString() };
}

async function loadBoard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ board: PipelineBoard; assetId: string | null }> {
  const { data } = await supabase
    .from("generated_assets")
    .select("id, content")
    .eq("user_id", userId)
    .eq("type", PIPELINE_ASSET_TYPE)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return { board: emptyBoard(), assetId: null };
  const content = data.content as PipelineBoard;
  return {
    board: {
      contacts: Array.isArray(content?.contacts) ? content.contacts : [],
      updated_at: content?.updated_at ?? new Date().toISOString(),
    },
    assetId: data.id as string,
  };
}

async function saveBoard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  assetId: string | null,
  board: PipelineBoard
): Promise<string | null> {
  const payload = {
    ...board,
    updated_at: new Date().toISOString(),
  };

  if (assetId) {
    const { error } = await supabase
      .from("generated_assets")
      .update({ content: payload })
      .eq("id", assetId)
      .eq("user_id", userId);
    if (error) throw error;
    return assetId;
  }

  const { data, error } = await supabase
    .from("generated_assets")
    .insert({
      user_id: userId,
      creation_id: null,
      type: PIPELINE_ASSET_TYPE,
      content: payload,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data?.id ?? null;
}

/** Pipeline (Growth+): maintain contacts and stages — Octolane-shaped job. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const tier = await requireTier(supabase, user.id, "growth");
  if ("error" in tier) {
    return NextResponse.json({ error: tier.error }, { status: tier.status });
  }

  const { board } = await loadBoard(supabase, user.id);
  return NextResponse.json({ board });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const tier = await requireTier(supabase, user.id, "growth");
  if ("error" in tier) {
    return NextResponse.json({ error: tier.error }, { status: tier.status });
  }

  let body: {
    action?: string;
    contact?: Partial<PipelineContact> & { name?: string };
    contactId?: string;
    stage?: string;
    draft?: string;
    notes?: string;
    next_action?: string;
    draft_status?: PipelineContact["draft_status"];
    outcome_note?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action ?? "list";
  const { board, assetId } = await loadBoard(supabase, user.id);
  let contacts = [...board.contacts];

  if (action === "list") {
    return NextResponse.json({ board });
  }

  if (action === "add") {
    const name = String(body.contact?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const stage = (body.contact?.stage ?? "identified") as PipelineStage;
    if (!STAGE_IDS.has(stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }
    const contact: PipelineContact = {
      id: newContactId(),
      name,
      channel: String(body.contact?.channel ?? "LinkedIn").trim() || "LinkedIn",
      company: String(body.contact?.company ?? "").trim() || undefined,
      stage,
      notes: String(body.contact?.notes ?? "").trim() || undefined,
      draft: String(body.contact?.draft ?? "").trim() || undefined,
      draft_status: body.contact?.draft
        ? "pending"
        : undefined,
      next_action:
        String(body.contact?.next_action ?? "").trim() ||
        "Draft personalized opener",
      last_touch_at: new Date().toISOString(),
      creation_id: body.contact?.creation_id ?? null,
    };
    contacts = [contact, ...contacts];
  } else if (action === "update") {
    const id = body.contactId;
    if (!id) {
      return NextResponse.json({ error: "contactId required" }, { status: 400 });
    }
    const idx = contacts.findIndex((c) => c.id === id);
    if (idx < 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    const current = contacts[idx];
    let stage = current.stage;
    if (body.stage) {
      if (!STAGE_IDS.has(body.stage as PipelineStage)) {
        return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
      }
      stage = body.stage as PipelineStage;
    }
    contacts[idx] = {
      ...current,
      stage,
      draft:
        body.draft !== undefined
          ? String(body.draft).trim() || undefined
          : current.draft,
      notes:
        body.notes !== undefined
          ? String(body.notes).trim() || undefined
          : current.notes,
      next_action:
        body.next_action !== undefined
          ? String(body.next_action).trim() || undefined
          : current.next_action,
      draft_status:
        body.draft_status !== undefined
          ? body.draft_status
          : current.draft_status,
      outcome_note:
        body.outcome_note !== undefined
          ? String(body.outcome_note).trim() || undefined
          : current.outcome_note,
      outcome_at:
        body.outcome_note !== undefined
          ? new Date().toISOString()
          : current.outcome_at,
      last_touch_at: new Date().toISOString(),
    };
  } else if (action === "mark_sent") {
    const id = body.contactId;
    if (!id) {
      return NextResponse.json({ error: "contactId required" }, { status: 400 });
    }
    const idx = contacts.findIndex((c) => c.id === id);
    if (idx < 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    contacts[idx] = {
      ...contacts[idx],
      stage: "sent",
      draft_status: "sent",
      next_action: "Wait 2 days, then follow up",
      last_touch_at: new Date().toISOString(),
    };
  } else if (action === "delete") {
    const id = body.contactId;
    if (!id) {
      return NextResponse.json({ error: "contactId required" }, { status: 400 });
    }
    contacts = contacts.filter((c) => c.id !== id);
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const nextBoard: PipelineBoard = {
    contacts,
    updated_at: new Date().toISOString(),
  };

  try {
    await saveBoard(supabase, user.id, assetId, nextBoard);
  } catch (err) {
    console.error("Pipeline save failed:", err);
    return NextResponse.json(
      { error: "Could not save pipeline." },
      { status: 500 }
    );
  }

  trackToolRun("pipeline", { action }, { userId: user.id, path: "/api/pipeline" });
  return NextResponse.json({ board: nextBoard });
}
