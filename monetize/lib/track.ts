/**
 * Client-side activity tracking for the founder Counter.
 * Fire-and-forget; never blocks UX.
 */

const SESSION_KEY = "rain-analytics-session";

export type TrackProps = Record<string, string | number | boolean | null | undefined>;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `s_${Date.now()}`;
  }
}

function readUtm(): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
} {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = {
      utm_source: params.get("utm_source") ?? undefined,
      utm_medium: params.get("utm_medium") ?? undefined,
      utm_campaign: params.get("utm_campaign") ?? undefined,
    };
    if (fromUrl.utm_source || fromUrl.utm_medium || fromUrl.utm_campaign) {
      sessionStorage.setItem("rain-utm", JSON.stringify(fromUrl));
      return fromUrl;
    }
    const raw = sessionStorage.getItem("rain-utm");
    if (raw) return JSON.parse(raw) as typeof fromUrl;
  } catch {
    /* ignore */
  }
  return {};
}

/** Record a named event. Safe to call from anywhere in the client. */
export function track(name: string, props: TrackProps = {}): void {
  if (typeof window === "undefined") return;

  const utm = readUtm();
  const body = {
    name,
    path: window.location.pathname + window.location.search,
    referrer: document.referrer || undefined,
    session_id: getSessionId(),
    ...utm,
    props,
  };

  try {
    const json = JSON.stringify(body);
    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
      return;
    }
  } catch {
    /* fall through */
  }

  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

export function trackPageView(path?: string): void {
  track("page_view", {
    page: path ?? (typeof window !== "undefined" ? window.location.pathname : ""),
  });
}
