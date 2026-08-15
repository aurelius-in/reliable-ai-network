"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Send } from "lucide-react";
import {
  ChipGroup,
  CopyButton,
  ErrorText,
  FieldLabel,
} from "@/components/ui";
import {
  PIPELINE_CHANNELS,
  PIPELINE_STAGES,
} from "@/lib/pipeline";
import type { PipelineBoard, PipelineContact, PipelineStage } from "@/types";

export function PipelineBoardPanel({
  initialBoard = null,
}: {
  initialBoard?: PipelineBoard | null;
}) {
  const [board, setBoard] = useState<PipelineBoard | null>(initialBoard);
  const [loading, setLoading] = useState(!initialBoard);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [channel, setChannel] = useState("LinkedIn");
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<PipelineStage | "active">("active");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pipeline");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load pipeline");
      setBoard(data.board);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialBoard) void refresh();
  }, [initialBoard, refresh]);

  async function mutate(body: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not update pipeline");
      setBoard(data.board);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function addContact() {
    if (!name.trim()) return;
    const ok = await mutate({
      action: "add",
      contact: {
        name: name.trim(),
        company: company.trim() || undefined,
        channel,
        draft: draft.trim() || undefined,
        stage: draft.trim() ? "drafted" : "identified",
        next_action: draft.trim()
          ? "Approve and send"
          : "Draft personalized opener",
      },
    });
    if (ok) {
      setName("");
      setCompany("");
      setDraft("");
    }
  }

  const contacts = board?.contacts ?? [];
  const visible = contacts.filter((c) => {
    if (filter === "active") {
      return !["won", "lost"].includes(c.stage);
    }
    return c.stage === filter;
  });

  const counts = PIPELINE_STAGES.map((s) => ({
    ...s,
    n: contacts.filter((c) => c.stage === s.id).length,
  }));

  return (
    <div className="rounded-2xl border border-aqua/30 bg-gradient-to-br from-aqua/10 via-night-800 to-night-800 p-5 sm:p-6">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
        Pipeline
      </p>
      <h2 className="mt-1.5 text-xl font-black text-white sm:text-2xl">
        Maintain who you are selling to
      </h2>
      <p className="mt-2 text-sm text-slate-300">
        Identified → drafted → sent → replied → meeting → won. Log outcomes so
        the next move gets smarter — not another CRM you abandon.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilter("active")}
          className={`chip ${filter === "active" ? "chip-on" : ""}`}
        >
          Active ({contacts.filter((c) => !["won", "lost"].includes(c.stage)).length})
        </button>
        {counts.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setFilter(s.id)}
            className={`chip ${filter === s.id ? "chip-on" : ""}`}
          >
            {s.label} ({s.n})
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3 rounded-xl border border-night-600 bg-night-800/80 p-4">
        <FieldLabel>Add a person</FieldLabel>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-sm text-white outline-none focus:border-aqua/50"
          />
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company (optional)"
            className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-sm text-white outline-none focus:border-aqua/50"
          />
        </div>
        <ChipGroup
          options={PIPELINE_CHANNELS}
          value={channel}
          onChange={setChannel}
          ariaLabel="Channel"
        />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste DM/email draft (optional)"
          rows={3}
          className="w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-aqua/50"
        />
        <button
          type="button"
          onClick={addContact}
          disabled={saving || !name.trim()}
          className="btn-primary"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Add to pipeline
        </button>
      </div>

      <ErrorText message={error} />

      {loading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={14} className="animate-spin" /> Loading pipeline…
        </p>
      )}

      {!loading && visible.length === 0 && (
        <p className="mt-4 text-sm text-slate-400">
          No contacts here yet. Add someone you will ask to pay this week.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {visible.map((c) => (
          <ContactCard
            key={c.id}
            contact={c}
            busy={saving}
            onStage={(stage) =>
              mutate({ action: "update", contactId: c.id, stage })
            }
            onMarkSent={() => mutate({ action: "mark_sent", contactId: c.id })}
            onDraftStatus={(draft_status) =>
              mutate({
                action: "update",
                contactId: c.id,
                draft_status,
                stage:
                  draft_status === "approved"
                    ? "drafted"
                    : draft_status === "rejected"
                      ? "identified"
                      : undefined,
                next_action:
                  draft_status === "approved"
                    ? "Send today"
                    : draft_status === "rejected"
                      ? "Rewrite opener"
                      : undefined,
              })
            }
            onOutcome={(outcome_note, stage) =>
              mutate({
                action: "update",
                contactId: c.id,
                outcome_note,
                stage,
                next_action:
                  stage === "won"
                    ? "Capture what closed"
                    : stage === "lost"
                      ? "Log objection into offer rewrite"
                      : "Follow up with proof pack",
              })
            }
            onDelete={() => mutate({ action: "delete", contactId: c.id })}
          />
        ))}
      </div>
    </div>
  );
}

function ContactCard({
  contact,
  busy,
  onStage,
  onMarkSent,
  onDraftStatus,
  onOutcome,
  onDelete,
}: {
  contact: PipelineContact;
  busy: boolean;
  onStage: (stage: PipelineStage) => void;
  onMarkSent: () => void;
  onDraftStatus: (status: NonNullable<PipelineContact["draft_status"]>) => void;
  onOutcome: (note: string, stage: PipelineStage) => void;
  onDelete: () => void;
}) {
  const [outcomeDraft, setOutcomeDraft] = useState("");
  const mailto =
    contact.channel === "Email" && contact.draft
      ? `mailto:?subject=${encodeURIComponent("Quick question")}&body=${encodeURIComponent(contact.draft)}`
      : null;

  return (
    <div className="rounded-xl border border-night-600 bg-night-800/90 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold text-white">
            {contact.name}
            {contact.company ? (
              <span className="font-normal text-slate-400">
                {" "}
                · {contact.company}
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {contact.channel} · {contact.stage}
            {contact.draft_status ? ` · draft ${contact.draft_status}` : ""}
          </p>
        </div>
        <select
          value={contact.stage}
          disabled={busy}
          onChange={(e) => onStage(e.target.value as PipelineStage)}
          className="rounded-lg border border-night-600 bg-night-900 px-2 py-1 text-xs text-white"
        >
          {PIPELINE_STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {contact.next_action && (
        <p className="mt-2 text-xs text-aqua">Next: {contact.next_action}</p>
      )}
      {contact.outcome_note && (
        <p className="mt-2 rounded-lg border border-white/10 bg-night-900/60 px-2.5 py-1.5 text-xs text-slate-300">
          Outcome: {contact.outcome_note}
        </p>
      )}
      {contact.draft && (
        <div className="mt-3">
          <p className="whitespace-pre-wrap text-sm text-slate-300">
            {contact.draft}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <CopyButton text={contact.draft} label="Copy draft" />
            {mailto && (
              <a
                href={mailto}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:border-aqua/40"
              >
                Open email
              </a>
            )}
            {contact.draft_status !== "approved" &&
              contact.draft_status !== "sent" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDraftStatus("approved")}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300"
                >
                  Approve draft
                </button>
              )}
            {contact.draft_status !== "rejected" &&
              contact.stage !== "sent" &&
              contact.stage !== "won" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDraftStatus("rejected")}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300"
                >
                  Reject / rewrite
                </button>
              )}
            {contact.stage !== "sent" &&
              contact.stage !== "replied" &&
              contact.stage !== "won" &&
              contact.stage !== "lost" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onMarkSent}
                  className="inline-flex items-center gap-1 rounded-lg border border-aqua/40 bg-aqua/10 px-2.5 py-1 text-xs font-semibold text-aqua"
                >
                  <Send size={12} /> Mark sent
                </button>
              )}
          </div>
        </div>
      )}
      {["replied", "meeting", "sent", "won", "lost"].includes(contact.stage) && (
        <div className="mt-3 space-y-2">
          <textarea
            value={outcomeDraft}
            onChange={(e) => setOutcomeDraft(e.target.value)}
            rows={2}
            placeholder="What happened? Buyer language, objection, next ask…"
            className="w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-aqua/50"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !outcomeDraft.trim()}
              onClick={() => {
                onOutcome(outcomeDraft.trim(), "replied");
                setOutcomeDraft("");
              }}
              className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200"
            >
              Log reply
            </button>
            <button
              type="button"
              disabled={busy || !outcomeDraft.trim()}
              onClick={() => {
                onOutcome(outcomeDraft.trim(), "won");
                setOutcomeDraft("");
              }}
              className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300"
            >
              Log won
            </button>
            <button
              type="button"
              disabled={busy || !outcomeDraft.trim()}
              onClick={() => {
                onOutcome(outcomeDraft.trim(), "lost");
                setOutcomeDraft("");
              }}
              className="rounded-lg border border-red-400/30 px-2.5 py-1 text-xs font-semibold text-red-300"
            >
              Log lost
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={onDelete}
        className="mt-3 text-[11px] text-slate-500 hover:text-red-300"
      >
        Remove
      </button>
    </div>
  );
}
