export type Attribution = {
  first_touch_source: string | null;
  first_touch_medium: string | null;
  first_touch_campaign: string | null;
  first_touch_content: string | null;
  first_touch_term: string | null;
  first_referrer: string | null;
  last_touch_source: string | null;
  last_touch_medium: string | null;
  last_touch_campaign: string | null;
  landing_url: string | null;
};

const ATTR_KEY = "rain_select_attr";

function readParams(search: string) {
  const p = new URLSearchParams(search);
  return {
    source: p.get("utm_source"),
    medium: p.get("utm_medium"),
    campaign: p.get("utm_campaign"),
    content: p.get("utm_content"),
    term: p.get("utm_term"),
  };
}

export function captureAttribution(): Attribution {
  const empty: Attribution = {
    first_touch_source: null,
    first_touch_medium: null,
    first_touch_campaign: null,
    first_touch_content: null,
    first_touch_term: null,
    first_referrer: null,
    last_touch_source: null,
    last_touch_medium: null,
    last_touch_campaign: null,
    landing_url: null,
  };
  if (typeof window === "undefined") return empty;
  const now = readParams(window.location.search);
  const referrer = document.referrer || null;
  let stored: Attribution | null = null;
  try {
    const raw = localStorage.getItem(ATTR_KEY);
    if (raw) stored = JSON.parse(raw) as Attribution;
  } catch {
    /* ignore */
  }
  const last: Attribution = {
    first_touch_source: stored?.first_touch_source || now.source,
    first_touch_medium: stored?.first_touch_medium || now.medium,
    first_touch_campaign: stored?.first_touch_campaign || now.campaign,
    first_touch_content: stored?.first_touch_content || now.content,
    first_touch_term: stored?.first_touch_term || now.term,
    first_referrer: stored?.first_referrer || referrer,
    last_touch_source: now.source || stored?.last_touch_source || null,
    last_touch_medium: now.medium || stored?.last_touch_medium || null,
    last_touch_campaign: now.campaign || stored?.last_touch_campaign || null,
    landing_url: stored?.landing_url || window.location.href,
  };
  try {
    localStorage.setItem(ATTR_KEY, JSON.stringify(last));
  } catch {
    /* ignore */
  }
  return last;
}

export function loadAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ATTR_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
