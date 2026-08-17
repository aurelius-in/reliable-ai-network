/**
 * Mark currently unconfirmed auth users as confirmed so password login works.
 * Confirmation email remains optional. Run after deploy:
 *   node scripts/open-unconfirmed-accounts.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(name) {
  const p = resolve(root, name);
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !key || key === "[SENSITIVE]") {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 200,
});
if (error) {
  console.error(error.message);
  process.exit(1);
}

const pending = data.users.filter((u) => u.email && !u.email_confirmed_at);
console.log("unconfirmed", pending.length);

for (const user of pending) {
  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
    user_metadata: {
      ...(user.user_metadata ?? {}),
      confirm_later: true,
    },
  });
  if (updateError) {
    console.error("fail", user.email, updateError.message);
    continue;
  }
  console.log("opened", user.email);
}
