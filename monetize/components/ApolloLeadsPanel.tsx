"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Search } from "lucide-react";
import { CopyButton, ErrorText } from "@/components/ui";
import { buildLeadDm } from "@/lib/apollo-icp";
import type { BuyerPersona } from "@/types";

export type ApolloLeadRow = {
  name: string;
  title: string;
  company: string | null;
  linkedinUrl: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  headline: string | null;
};

/**
 * Shared Apollo leads UI for Buyers, Sales, and Launch tabs.
 */
export function ApolloLeadsPanel({
  persona,
  targetBuyer,
  audience,
  productTitle,
  openerTemplate,
  positioningLine,
  compact,
}: {
  persona?: BuyerPersona;
  targetBuyer?: string;
  audience?: string;
  productTitle?: string;
  openerTemplate?: string;
  positioningLine?: string;
  compact?: boolean;
}) {
  const [leads, setLeads] = useState<ApolloLeadRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function findLeads() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/buyers/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          targetBuyer,
          audience,
          productTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lead search failed");
      setLeads(data.leads ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lead search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "mt-3" : "mt-4 border-t border-night-600 pt-4"}>
      <button
        type="button"
        onClick={findLeads}
        disabled={loading}
        className="btn-secondary inline-flex items-center gap-2"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Search size={14} />
        )}
        {leads ? "Refresh matching leads" : "Find matching leads"}
      </button>
      <p className="mt-1.5 text-[11px] text-slate-500">
        Pulls real people from Apollo so you can message someone today.
      </p>
      <ErrorText message={error} />

      {leads && leads.length === 0 && !loading && (
        <p className="mt-3 text-xs text-slate-400">
          Apollo returned no people for these filters. Try refresh once.
        </p>
      )}

      {leads && leads.length > 0 && (
        <ul className="mt-3 space-y-2">
          {leads.map((lead, li) => {
            const dm = buildLeadDm({
              leadName: lead.name,
              personaName: persona?.name,
              positioningLine:
                positioningLine || persona?.positioning_line,
              openerTemplate,
              productHint: productTitle,
            });
            const location = [lead.city, lead.state, lead.country]
              .filter(Boolean)
              .join(", ");
            return (
              <li
                key={`${lead.name}-${lead.title}-${li}`}
                className="rounded-lg bg-night-800 p-3 text-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-white">{lead.name}</p>
                    <p className="text-slate-300">
                      {lead.title}
                      {lead.company ? ` @ ${lead.company}` : ""}
                    </p>
                    {location && (
                      <p className="mt-0.5 text-slate-500">{location}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.linkedinUrl && (
                      <a
                        href={lead.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-night-700 px-2 py-1 font-semibold text-aqua hover:underline"
                      >
                        LinkedIn <ExternalLink size={11} />
                      </a>
                    )}
                    <CopyButton text={dm} label="Copy DM" />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
