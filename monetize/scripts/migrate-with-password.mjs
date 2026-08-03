import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dns from "dns";
import { promisify } from "util";

const resolve6 = promisify(dns.resolve6);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const password = process.env.SUPABASE_DB_PASSWORD || process.argv[2];
if (!password) {
  console.error("Missing password");
  process.exit(1);
}

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 1) continue;
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[line.slice(0, i).trim()] = val;
  }
  return env;
}

const env = {
  ...loadEnv(path.join(root, ".env.vercel.prod")),
  ...loadEnv(path.join(root, ".env.local")),
};

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "";
const ref = supabaseUrl.replace(/^https?:\/\//, "").split(".")[0];
if (!ref) {
  console.error("No project ref from NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

const sql = [
  "supabase/creations_expert.sql",
  "supabase/creations_website.sql",
  "supabase/shared_reports.sql",
]
  .map((f) => fs.readFileSync(path.join(root, f), "utf8"))
  .join("\n\n");

const encoded = encodeURIComponent(password);
const regions = [
  "us-west-2",
  "us-west-1",
  "us-east-1",
  "us-east-2",
  "eu-west-1",
  "eu-west-2",
  "eu-central-1",
  "ap-southeast-1",
  "ap-northeast-1",
  "ca-central-1",
  "sa-east-1",
];

const candidates = [];

// Prefer pooler session mode (IPv4) across regions
for (const region of regions) {
  for (const prefix of ["aws-0", "aws-1", "aws"]) {
    candidates.push(
      `postgresql://postgres.${ref}:${encoded}@${prefix}-${region}.pooler.supabase.com:5432/postgres`
    );
    candidates.push(
      `postgresql://postgres.${ref}:${encoded}@${prefix}-${region}.pooler.supabase.com:6543/postgres`
    );
  }
}

// Direct via IPv6 literal if DNS resolves
try {
  const v6 = await resolve6(`db.${ref}.supabase.co`);
  for (const ip of v6) {
    candidates.unshift(
      `postgresql://postgres:${encoded}@[${ip}]:5432/postgres`
    );
  }
  console.log("Resolved IPv6:", v6.join(", "));
} catch (err) {
  console.log("No IPv6 resolve:", err.message);
}

candidates.push(
  `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`
);

async function tryConnect(url) {
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  await client.connect();
  return client;
}

let client = null;
let used = null;
const errors = [];

for (const url of candidates) {
  const host = url.split("@")[1]?.split("/")[0] || url;
  try {
    process.stdout.write(`Trying ${host} ... `);
    client = await tryConnect(url);
    used = host;
    console.log("connected");
    break;
  } catch (err) {
    console.log(err.message.split("\n")[0].slice(0, 80));
    errors.push(`${host}: ${err.message}`);
  }
}

if (!client) {
  console.error("Could not connect. Sample errors:");
  for (const e of errors.slice(0, 8)) console.error(" -", e);
  process.exit(1);
}

try {
  await client.query(sql);
  console.log("OK: migrations applied via", used);
  const check = await client.query(`
    select column_name
    from information_schema.columns
    where table_schema = 'public' and table_name = 'creations'
      and column_name in ('product_url','website_context','evidence_docs','github_context','stage')
    order by column_name
  `);
  console.log(
    "creations columns:",
    check.rows.map((r) => r.column_name).join(", ")
  );
  const tables = await client.query(`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_name = 'shared_reports'
  `);
  console.log(
    "shared_reports:",
    tables.rows.length ? "present" : "MISSING"
  );
} finally {
  await client.end();
}
