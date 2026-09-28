export const META_PIXEL_ID = "1746612416455864";
export const PIXEL_PRODUCT = "Make it RAIN";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: Fbq;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

function skipPath(path: string): boolean {
  return path.startsWith("/admin") || path.startsWith("/select");
}

export function pixelTrack(event: string, params?: Record<string, string | number | boolean>): void {
  if (typeof window === "undefined") return;
  if (skipPath(window.location.pathname)) return;
  window.fbq?.("track", event, { content_name: PIXEL_PRODUCT, ...params });
}

export function pixelPageView(): void {
  pixelTrack("PageView");
}

const EVENT_MAP: Record<string, { event: string; params?: Record<string, string | number | boolean> }> = {
  home_url_submit: { event: "ViewContent", params: { content_category: "first_customer_path" } },
  home_teaser_ok: { event: "ViewContent", params: { content_category: "first_customer_path" } },
  fcp_cta_clicked: { event: "ViewContent", params: { content_category: "first_customer_path" } },
  signup_submit: { event: "Lead", params: { content_category: "signup" } },
  signup_success: { event: "CompleteRegistration" },
  checklist_signup: { event: "Lead", params: { content_category: "checklist" } },
  checkout_click: { event: "InitiateCheckout", params: { value: 29, currency: "USD" } },
  checkout_open_embedded: { event: "InitiateCheckout", params: { value: 29, currency: "USD" } },
  checkout_redirect_signup: { event: "InitiateCheckout", params: { value: 29, currency: "USD" } },
  checkout_success: { event: "Purchase", params: { value: 29, currency: "USD" } },
  activate_trial_click: { event: "StartTrial", params: { value: 29, currency: "USD" } },
  paid_next_trial_click: { event: "StartTrial", params: { value: 29, currency: "USD" } },
};

export function mirrorPixelEvent(name: string): void {
  if (name === "page_view") return;
  const mapped = EVENT_MAP[name];
  if (!mapped) return;
  pixelTrack(mapped.event, mapped.params);
}
