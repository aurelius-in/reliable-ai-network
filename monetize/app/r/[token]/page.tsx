import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfessionalReportView } from "@/components/ProfessionalReportView";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SharedReportPayload } from "@/lib/shared-report";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

async function loadReport(token: string) {
  if (!token || token.length < 16) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("shared_reports")
      .select("title, payload, created_at, revoked_at")
      .eq("token", token)
      .maybeSingle();
    if (error || !data || data.revoked_at) return null;
    return data as {
      title: string;
      payload: SharedReportPayload;
      created_at: string;
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const report = await loadReport(token);
  if (!report) return { title: "Brief not found · Make it RAIN" };
  const product = report.payload.product?.title || "Monetization Brief";
  return {
    title: `${product}: Monetization Brief`,
    description: `First Customer Path brief for ${product}`,
    robots: { index: false, follow: false },
  };
}

export default async function SharedReportPage({ params }: Props) {
  const { token } = await params;
  const report = await loadReport(token);
  if (!report) notFound();

  const generating = report.payload?.status === "generating";

  return (
    <div className="report-shell min-h-screen bg-[#f4f2ee] text-stone-900">
      {generating ? (
        <meta httpEquiv="refresh" content="8" />
      ) : null}
      <div className="no-print sticky top-0 z-10 border-b border-stone-200/80 bg-[#f4f2ee]/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-2.5 sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
            {generating ? "Generating brief…" : "First Customer Path"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50"
              id="report-print-btn"
            >
              Print / PDF
            </button>
            <a
              href="https://makeitrainapp.com"
              className="rounded border border-stone-900 bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800"
            >
              Make it RAIN
            </a>
          </div>
        </div>
      </div>
      <ProfessionalReportView payload={report.payload} title={report.title} />
      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById('report-print-btn')?.addEventListener('click',()=>window.print());`,
        }}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        .report-shell { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }
        .report-doc .font-serif, .report-doc h1, .report-doc h2, .report-doc blockquote {
          font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif;
        }
        @media print {
          .no-print { display: none !important; }
          .report-shell { background: white !important; }
          .report-doc { padding-top: 0 !important; }
          table { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
