import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const password = process.env.SUPABASE_DB_PASSWORD || process.argv[2];
const ref = "xpisrbrywyhpsnltyslv";

const sql = [
  "supabase/creations_expert.sql",
  "supabase/creations_website.sql",
  "supabase/shared_reports.sql",
]
  .map((f) => fs.readFileSync(path.join(root, f), "utf8"))
  .join("\n\n");

const attempts = [
  {
    host: "aws-1-us-west-2.pooler.supabase.com",
    port: 5432,
    user: `postgres.${ref}`,
  },
  {
    host: "aws-1-us-west-2.pooler.supabase.com",
    port: 6543,
    user: `postgres.${ref}`,
  },
  {
    host: "aws-1-us-west-2.pooler.supabase.com",
    port: 5432,
    user: "postgres",
  },
  {
    host: "aws-0-us-west-2.pooler.supabase.com",
    port: 5432,
    user: `postgres.${ref}`,
  },
  {
    host: "aws-1-us-west-2.pooler.supabase.com",
    port: 5432,
    user: `${ref}`,
  },
];

for (const a of attempts) {
  const label = `${a.user}@${a.host}:${a.port}`;
  process.stdout.write(`Trying ${label} ... `);
  const client = new pg.Client({
    host: a.host,
    port: a.port,
    user: a.user,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 12000,
  });
  try {
    await client.connect();
    console.log("connected");
    await client.query(sql);
    const check = await client.query(`
      select column_name from information_schema.columns
      where table_schema='public' and table_name='creations'
        and column_name in ('product_url','website_context','evidence_docs','github_context','stage')
      order by 1`);
    console.log(
      "OK columns:",
      check.rows.map((r) => r.column_name).join(", ")
    );
    const t = await client.query(`
      select 1 from information_schema.tables
      where table_schema='public' and table_name='shared_reports'`);
    console.log("shared_reports:", t.rowCount ? "present" : "MISSING");
    await client.end();
    process.exit(0);
  } catch (err) {
    console.log(err.message.split("\n")[0].slice(0, 100));
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
}

console.error("All attempts failed with this password.");
process.exit(1);
