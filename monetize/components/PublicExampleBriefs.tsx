import { TrackedLink } from "@/components/TrackedLink";
import {
  PUBLIC_EXAMPLE_BRIEFS,
  PUBLIC_EXAMPLES_WHY,
} from "@/lib/public-example-briefs";

/** Homepage / marketing strip: anonymized live Founder Briefs. */
export function PublicExampleBriefs({
  id = "examples",
}: {
  id?: string;
}) {
  return (
    <section
      id={id}
      className="fade-up mt-8 w-full max-w-2xl scroll-mt-24 text-left sm:mt-10"
    >
      <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
        Real output
      </p>
      <h2 className="mt-1.5 text-center text-lg font-bold text-white sm:mt-2 sm:text-2xl">
        {PUBLIC_EXAMPLES_WHY.headline}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-slate-300">
        {PUBLIC_EXAMPLES_WHY.how}
      </p>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-slate-400">
        {PUBLIC_EXAMPLES_WHY.why}
      </p>

      <ul className="mt-5 space-y-3">
        {PUBLIC_EXAMPLE_BRIEFS.map((ex) => (
          <li
            key={ex.id}
            className="rounded-xl border border-white/10 bg-night-800/70 px-4 py-3.5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-white">
                  {ex.label}{" "}
                  <span className="font-normal text-slate-400">
                    · {ex.category}
                  </span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {ex.blurb}
                </p>
              </div>
              <TrackedLink
                href={ex.href}
                trackTarget={`home_example_${ex.id}`}
                className="shrink-0 rounded-lg border border-aqua/40 bg-aqua/10 px-3 py-1.5 text-xs font-semibold text-aqua-bright transition hover:border-aqua/70 hover:bg-aqua/15"
              >
                Open brief
              </TrackedLink>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-xs text-slate-500">
        {PUBLIC_EXAMPLES_WHY.cta}{" "}
        <TrackedLink
          href="/signup"
          trackTarget="home_examples_signup"
          className="font-semibold text-aqua hover:text-aqua-bright"
        >
          Find who may pay
        </TrackedLink>
      </p>
    </section>
  );
}
