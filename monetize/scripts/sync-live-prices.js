const key = process.env.STRIPE_LIVE_SECRET_KEY || "";
if (!key.startsWith("sk_live_")) {
  console.error("need STRIPE_LIVE_SECRET_KEY");
  process.exit(1);
}

const PRODUCTS = {
  starter: "prod_UtrQhEbil2OstN",
  growth: "prod_UtrQMTwfxOet70",
  pro: "prod_UtrQXhFnrWqDCn",
};

async function stripe(method, path, body) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || res.status + " " + path);
  return data;
}

async function ensurePrice(tier, productId, unitAmount) {
  const list = await stripe(
    "GET",
    `prices?product=${productId}&active=true&limit=100`
  );
  const existing = (list.data || []).find(
    (p) =>
      p.unit_amount === unitAmount &&
      p.recurring?.interval === "month" &&
      p.currency === "usd"
  );
  if (existing) {
    return { id: existing.id, created: false };
  }
  const created = await stripe("POST", "prices", {
    currency: "usd",
    unit_amount: String(unitAmount),
    "recurring[interval]": "month",
    product: productId,
    nickname: `rain_${tier}_${unitAmount}`,
    "metadata[tier]": tier,
  });
  return { id: created.id, created: true };
}

(async () => {
  const starter = await ensurePrice("starter", PRODUCTS.starter, 2900);
  const growth = await ensurePrice("growth", PRODUCTS.growth, 7900);
  const pro = await ensurePrice("pro", PRODUCTS.pro, 14900);
  console.log(
    JSON.stringify(
      {
        STRIPE_PRICE_STARTER: starter.id,
        STRIPE_PRICE_GROWTH: growth.id,
        STRIPE_PRICE_PRO: pro.id,
        created: {
          starter: starter.created,
          growth: growth.created,
          pro: pro.created,
        },
      },
      null,
      2
    )
  );

  // Expand promos properly
  for (const code of ["RAIN26", "RAINVIP"]) {
    const list = await stripe("GET", `promotion_codes?code=${code}&limit=1`);
    const p = (list.data || [])[0];
    if (!p) {
      console.log(code, "MISSING");
      continue;
    }
    const couponId = typeof p.coupon === "string" ? p.coupon : p.coupon?.id;
    const c = await stripe("GET", `coupons/${couponId}`);
    console.log(code, {
      active: p.active,
      expires_at: p.expires_at
        ? new Date(p.expires_at * 1000).toISOString()
        : null,
      percent_off: c.percent_off,
      duration: c.duration,
      applies_to: c.applies_to || null,
    });
  }
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
