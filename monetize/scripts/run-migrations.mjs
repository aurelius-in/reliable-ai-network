/**
 * Apply expert / website / shared_reports SQL via Supabase SQL API if available,
 * else via postgres connection string from .env.local / .env.vercel.prod.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = {
  ...loadEnvFile(path.join(root, ".env.vercel.prod")),
  ...loadEnvFile(path.join(root, ".env.local")),
};

const sqlFiles = [
  "supabase/creations_expert.sql",
  "supabase/creations_website.sql",
  "supabase/shared_reports.sql",
];

const sql = sqlFiles
  .map((f) => fs.readFileSync(path.join(root, f), "utf8"))
  .join("\n\n");

const dbUrl =
  env.DATABASE_URL ||
  env.POSTGRES_URL ||
  env.SUPABASE_DB_URL ||
  env.DIRECT_URL ||
  env.POSTGRES_URL_NON_POOLING;

async function runViaPostgres(url) {
  const { default: pg } = await import("pg").catch(() => ({ default: null }));
  if (!pg) {
    throw new Error("pg package not installed");
  }
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

async function runViaManagementApi() {
  const token = env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_PAT;
  const ref =
    env.SUPABASE_PROJECT_REF ||
    (env.NEXT_PUBLIC_SUPABASE_URL || "")
      .replace(/^https?:\/\//, "")
      .split(".")[0];
  if (!token || !ref) {
    throw new Error("No SUPABASE_ACCESS_TOKEN / project ref for Management API");
  }
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${text.slice(0, 400)}`);
  }
  return text;
}

async function main() {
  console.log("Migration keys present:");
  console.log(
    "  NEXT_PUBLIC_SUPABASE_URL:",
    env.NEXT_PUBLIC_SUPABASE_URL ? "yes" : "no"
  );
  console.log("  DATABASE_URL/POSTGRES:", dbUrl ? "yes" : "no");
  console.log(
    "  SUPABASE_ACCESS_TOKEN:",
    env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_PAT ? "yes" : "no"
  );

  if (dbUrl) {
    try {
      await import("pg");
    } catch {
      console.log("Installing pg…");
      const { execSync } = await import("child_process");
      execSync("npm install pg --no-save", { cwd: root, stdio: "inherit" });
    }
    await runViaPostgres(dbUrl);
    console.log("OK: migrations applied via Postgres");
    return;
  }

  await runViaManagementApi();
  console.log("OK: migrations applied via Supabase Management API");
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
