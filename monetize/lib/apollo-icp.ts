import type { BuyerPersona } from "@/types";
import type { ApolloPeopleSearchInput } from "@/lib/apollo";

/**
 * Map a RAIN buyer persona into Apollo people_search filters.
 * Heuristic only (no extra LLM call) so lead lookup stays fast/cheap.
 *
 * Important: Apollo q_keywords is AND-ish and fragile. Do NOT dump
 * persona names, ages, or free-form "who" prose into keywords.
 */
export function personaToApolloSearch(
  persona: BuyerPersona
): ApolloPeopleSearchInput {
  return audienceTextToApolloSearch(
    [persona.name, persona.who, persona.where_online.join(" ")].join(" ")
  );
}

/** Map Sales/Launch audience chips or free text into Apollo filters. */
export function audienceTextToApolloSearch(
  audienceText: string
): ApolloPeopleSearchInput {
  const text = audienceText.toLowerCase();
  const titles = new Set<string>();
  const seniorities = new Set<string>();
  const keywordParts: string[] = [];

  const isIndie =
    /founder|startup|indie|saas|builder|hack|solopreneur|bootstrapp|buildinpublic/.test(
      text
    );
  const isCreator = /creator|influencer|youtuber|content/.test(text);
  const isSmb = /small business|shop|store|local business/.test(text);
  const isStudent = /student|college|university/.test(text);
  const isParent = /parent|family|\bmom\b|\bdad\b/.test(text);
  const isGamer = /gamer|gaming|discord|\bgame\b/.test(text);
  const isPro = /professional|busy|corporate|executive/.test(text);
  const isConsumer = /consumer|everyday|individual/.test(text);
  const isDev = /developer|engineer|\bdev\b|coder|ios|android|programming/.test(
    text
  );
  const isNoCode = /no-?code|bubble|glide|adalo|webflow/.test(text);

  if (isIndie || isNoCode) {
    ["Founder", "Co-Founder", "CEO", "Owner"].forEach((t) => titles.add(t));
    ["founder", "c_suite", "owner"].forEach((s) => seniorities.add(s));
    // Prefer 1-2 keywords max. 3+ terms often returns zero on Apollo.
    if (isNoCode) keywordParts.push("no-code");
    else if (/indie|hack|buildinpublic|solopreneur/.test(text)) {
      keywordParts.push("indie");
    } else {
      keywordParts.push("SaaS", "startup");
    }
  }

  if (isCreator) {
    ["Content Creator", "Founder", "Owner", "Creator"].forEach((t) =>
      titles.add(t)
    );
    if (keywordParts.length === 0) keywordParts.push("creator");
  }

  if (isSmb) {
    ["Owner", "Founder", "General Manager", "CEO"].forEach((t) =>
      titles.add(t)
    );
    ["owner", "founder", "c_suite", "manager"].forEach((s) =>
      seniorities.add(s)
    );
    if (keywordParts.length === 0) keywordParts.push("small business");
  }

  if (isStudent) {
    ["Student", "Intern", "Teaching Assistant"].forEach((t) => titles.add(t));
    if (keywordParts.length === 0) keywordParts.push("student");
  }

  if (isParent) {
    ["Parent", "Teacher", "Owner"].forEach((t) => titles.add(t));
    if (keywordParts.length === 0) keywordParts.push("parent");
  }

  if (isGamer) {
    ["Community Manager", "Game Developer", "Founder"].forEach((t) =>
      titles.add(t)
    );
    if (keywordParts.length === 0) keywordParts.push("gaming");
  }

  if (isPro) {
    ["Manager", "Director", "VP", "Consultant"].forEach((t) => titles.add(t));
    ["manager", "director", "vp", "senior"].forEach((s) => seniorities.add(s));
  }

  if (isConsumer) {
    ["Founder", "Owner", "Manager", "Consultant"].forEach((t) => titles.add(t));
  }

  // Indie founders who code: keep founder titles primary; don't AND
  // developer keywords or Apollo often returns zero.
  if (isDev && !isIndie && !isNoCode) {
    ["Software Engineer", "Full Stack Developer", "CTO", "Founder"].forEach(
      (t) => titles.add(t)
    );
    ["senior", "founder", "c_suite"].forEach((s) => seniorities.add(s));
    if (keywordParts.length === 0) keywordParts.push("software");
  }

  if (titles.size === 0) {
    ["Founder", "Owner", "CEO", "Manager"].forEach((t) => titles.add(t));
    ["owner", "founder", "c_suite", "manager"].forEach((s) =>
      seniorities.add(s)
    );
    if (keywordParts.length === 0) keywordParts.push("SaaS", "startup");
  }

  // Apollo q_keywords is fragile past ~2 terms.
  const qKeywords = [...new Set(keywordParts)].slice(0, 2).join(" ");

  return {
    personTitles: [...titles].slice(0, 5),
    personSeniorities: [...seniorities].slice(0, 3),
    qKeywords,
    perPage: 10,
  };
}

/** Ready-to-send opener using a template or persona one-liner. */
export function buildLeadDm(input: {
  leadName: string;
  personaName?: string;
  positioningLine?: string;
  openerTemplate?: string;
  productHint?: string;
}): string {
  const first = input.leadName.split(/\s+/)[0] || "there";

  if (input.openerTemplate?.trim()) {
    return input.openerTemplate
      .replace(/\[Name\]/gi, first)
      .replace(/\[name\]/g, first)
      .replace(/\{name\}/gi, first)
      .replace(/^Hey\b/i, `Hey ${first}`);
  }

  const product = input.productHint?.trim();
  const productBit = product ? ` around ${product}` : "";
  const line =
    input.positioningLine?.trim() ||
    "I built something that might help with what you're working on.";
  return `Hey ${first}, saw your work and thought of this${productBit}. ${line} Open to a quick look?`;
}

export function isOutreachLaunchDay(day: {
  title: string;
  action: string;
  script_label?: string | null;
  script?: string | null;
}): boolean {
  const text = [
    day.title,
    day.action,
    day.script_label ?? "",
    day.script ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return /dm|direct message|outreach|email|message people|personal message|cold|linkedin|connect with|reach out/.test(
    text
  );
}
