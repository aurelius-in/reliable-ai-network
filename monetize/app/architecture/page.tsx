import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Architecture — Make it RAIN",
  description:
    "RM-ODP architecture documentation for Make it RAIN. Unlisted investor and architecture review set.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

const DOCS = [
  {
    href: "/architecture/rain_platform_summary.html",
    tag: "One-pager",
    title: "Platform summary",
    body: "Problem thesis, pattern diagram, use cases, journey, stack, and boundaries for a five-minute skim.",
  },
  {
    href: "/architecture/rain_conceptual.html",
    tag: "Conceptual",
    title: "Conceptual architecture",
    body: "Enterprise intent, stakeholders, term mapping, information nouns, and computational story. Stakeholder-readable.",
  },
  {
    href: "/architecture/rain_logical.html",
    tag: "Logical",
    title: "Logical architecture",
    body: "Identifiers, service Does/Does-NOT boundaries, API surface map, checkout and tool sequences, tier gating.",
  },
  {
    href: "/architecture/rain_implementable.html",
    tag: "Implementable",
    title: "Implementable architecture",
    body: "As-built stack, persistence checklist, env inventory, security boundaries, and vertical-slice proof plan.",
  },
  {
    href: "/architecture/rain_ai_extensibility.html",
    tag: "AI",
    title: "AI extensibility",
    body: "Reasoning layer vs authority, tool pipeline, 15-tool catalog, prompt ownership, and how to extend safely.",
  },
] as const;

export default function ArchitectureHubPage() {
  return (
    <div className="min-h-screen bg-[#070a12] text-slate-300">
      <div
        className="border-b border-white/10"
        style={{
          background:
            "radial-gradient(900px 280px at 15% -10%, rgba(0,229,255,0.12), transparent 60%), radial-gradient(700px 240px at 90% 0%, rgba(230,0,255,0.08), transparent 55%)",
        }}
      >
        <div className="mx-auto max-w-[1100px] px-6 pb-12 pt-16">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-400">
            RM-ODP · Unlisted
          </p>
          <h1 className="max-w-[16ch] text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl">
            Make it RAIN architecture
          </h1>
          <p className="mt-4 max-w-[58ch] text-slate-400">
            Complete architecture documents for investors and critics who want
            evidence that the product was designed with clear authority
            boundaries: billing, identity, and AI as a reasoning layer.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-white/10 bg-[#0c1220] px-3 py-1">
              Not linked from product nav
            </span>
            <span className="rounded-full border border-white/10 bg-[#0c1220] px-3 py-1">
              Excluded from sitemap
            </span>
            <span className="rounded-full border border-white/10 bg-[#0c1220] px-3 py-1">
              noindex
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1100px] px-6 py-12">
        <div className="mb-8 rounded-2xl border border-white/10 bg-[#0c1220] p-5">
          <p className="text-sm leading-relaxed text-slate-400">
            Start with the{" "}
            <Link
              href="/architecture/rain_platform_summary.html"
              className="text-cyan-400 hover:underline"
            >
              platform summary
            </Link>
            , then Conceptual → Logical → Implementable. AI extensibility is the
            deep dive on Grok, Apollo, and tool contracts. Style and depth follow
            RM-ODP practice used in enterprise architecture sets (Reader&apos;s
            map, term tables, Does / Does NOT, as-built checklist).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {DOCS.map((doc) => (
            <a
              key={doc.href}
              href={doc.href}
              className="group rounded-2xl border border-white/10 bg-[#0c1220] p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/40"
            >
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-400">
                {doc.tag}
              </p>
              <h2 className="text-lg font-semibold text-slate-50 group-hover:text-white">
                {doc.title}
              </h2>
              <p className="mt-2 text-sm text-slate-400">{doc.body}</p>
            </a>
          ))}
        </div>

        <section className="mt-14 border-t border-white/10 pt-10">
          <h2 className="text-xl font-bold text-slate-50">Viewpoints covered</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="text-slate-200">
                  <th className="border border-white/10 bg-[#0c1220] px-3 py-2">
                    Viewpoint
                  </th>
                  <th className="border border-white/10 bg-[#0c1220] px-3 py-2">
                    Primary document
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr>
                  <td className="border border-white/10 px-3 py-2">Enterprise</td>
                  <td className="border border-white/10 px-3 py-2">
                    Conceptual · Platform summary
                  </td>
                </tr>
                <tr>
                  <td className="border border-white/10 px-3 py-2">Information</td>
                  <td className="border border-white/10 px-3 py-2">
                    Conceptual · Logical
                  </td>
                </tr>
                <tr>
                  <td className="border border-white/10 px-3 py-2">
                    Computational
                  </td>
                  <td className="border border-white/10 px-3 py-2">
                    Conceptual · Logical · AI
                  </td>
                </tr>
                <tr>
                  <td className="border border-white/10 px-3 py-2">Engineering</td>
                  <td className="border border-white/10 px-3 py-2">
                    Logical · Implementable
                  </td>
                </tr>
                <tr>
                  <td className="border border-white/10 px-3 py-2">Technology</td>
                  <td className="border border-white/10 px-3 py-2">
                    Implementable
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#0c1220]">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-slate-500">
          <span>Reliable AI Network, LLC · Architecture set</span>
          <span>Access by URL only · /architecture</span>
        </div>
      </footer>
    </div>
  );
}
