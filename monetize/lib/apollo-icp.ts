import type { BuyerPersona } from "@/types";
import type { ApolloPeopleSearchInput } from "@/lib/apollo";

/**
 * Map a RAIN buyer persona into Apollo people_search filters.
 * Heuristic only (no extra LLM call) so lead lookup stays fast/cheap.
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

  if (
    /founder|startup|indie|saas|builder|hack|solopreneur|bootstrapp/.test(text)
  ) {
    ["Founder", "Co-Founder", "CEO", "Owner"].forEach((t) => titles.add(t));
    ["owner", "founder", "c_suite"].forEach((s) => seniorities.add(s));
    keywordParts.push("SaaS", "startup", "founder");
  }

  if (/creator|influencer|youtuber|content/.test(text)) {
    ["Content Creator", "Founder", "Owner", "Creator"].forEach((t) =>
      titles.add(t)
    );
    keywordParts.push("creator", "content", "influencer");
  }

  if (/small business|owner|shop|store|local/.test(text)) {
    ["Owner", "Founder", "General Manager", "CEO"].forEach((t) =>
      titles.add(t)
    );
    ["owner", "founder", "c_suite", "manager"].forEach((s) =>
      seniorities.add(s)
    );
    keywordParts.push("small business", "owner");
  }

  if (/student|college|university/.test(text)) {
    ["Student", "Intern", "Teaching Assistant"].forEach((t) => titles.add(t));
    keywordParts.push("student", "university");
  }

  if (/parent|family|mom|dad/.test(text)) {
    ["Parent", "Teacher", "Owner"].forEach((t) => titles.add(t));
    keywordParts.push("parent", "family");
  }

  if (/gamer|gaming|discord|game/.test(text)) {
    ["Community Manager", "Game Developer", "Founder"].forEach((t) =>
      titles.add(t)
    );
    keywordParts.push("gaming", "community");
  }

  if (/professional|busy|corporate|executive/.test(text)) {
    ["Manager", "Director", "VP", "Consultant"].forEach((t) => titles.add(t));
    ["manager", "director", "vp", "senior"].forEach((s) => seniorities.add(s));
    keywordParts.push("professional");
  }

  if (/consumer|everyday|individual/.test(text)) {
    ["Founder", "Owner", "Manager", "Consultant"].forEach((t) => titles.add(t));
    keywordParts.push("consumer");
  }

  if (/developer|engineer|dev|coder/.test(text)) {
    ["Software Engineer", "Full Stack Developer", "CTO"].forEach((t) =>
      titles.add(t)
    );
    ["senior", "founder", "c_suite"].forEach((s) => seniorities.add(s));
    keywordParts.push("software", "developer");
  }

  if (titles.size === 0) {
    ["Founder", "Owner", "CEO", "Manager"].forEach((t) => titles.add(t));
    ["owner", "founder", "c_suite", "manager"].forEach((s) =>
      seniorities.add(s)
    );
  }

  const whoBits = audienceText
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 8);
  keywordParts.push(...whoBits);

  return {
    personTitles: [...titles].slice(0, 8),
    personSeniorities: [...seniorities].slice(0, 6),
    qKeywords: [...new Set(keywordParts)].slice(0, 12).join(" "),
    perPage: 20,
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
