import pg from "pg";

const { Pool } = pg;

// ── CONNECTION ────────────────────────────────────────────────
// Supabase gives you a DATABASE_URL in the format:
// postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

// ── SCHEMA INIT ───────────────────────────────────────────────
export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drafts (
      id          SERIAL PRIMARY KEY,
      status      TEXT    NOT NULL DEFAULT 'pending',
      category    TEXT    NOT NULL,
      sources     JSONB   NOT NULL DEFAULT '[]',
      source_ids  JSONB   NOT NULL DEFAULT '[]',
      text        TEXT    NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS github_updates (
      id           TEXT PRIMARY KEY,
      repo         TEXT NOT NULL,
      label        TEXT NOT NULL,
      category     TEXT NOT NULL,
      sha          TEXT NOT NULL,
      message      TEXT NOT NULL,
      author       TEXT NOT NULL,
      url          TEXT NOT NULL,
      weight       INTEGER NOT NULL DEFAULT 7,
      committed_at TIMESTAMPTZ NOT NULL,
      fetched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Seed one draft if table is empty
  const { rows } = await pool.query("SELECT COUNT(*) as c FROM drafts");
  if (parseInt(rows[0].c) === 0) {
    await insertDraft({
      status:     "pending",
      category:   "Builder Activity",
      sources:    ["GitHub"],
      source_ids: [],
      text:       "Dev update from the Monad labs this week:\n\n• EVM compatibility patches merged\n• RPC performance improvements shipped\n• deBridge cross-chain messaging live on testnet\n\nQuiet weeks in crypto mean loud months ahead.",
    });
    console.log("✓ Seeded initial draft");
  }
}

// ── DRAFT HELPERS ─────────────────────────────────────────────
export async function getAllDrafts() {
  const { rows } = await pool.query(
    "SELECT * FROM drafts ORDER BY created_at DESC"
  );
  return rows;
}

export async function insertDraft({ status, category, sources, source_ids, text }) {
  const { rows } = await pool.query(
    `INSERT INTO drafts (status, category, sources, source_ids, text)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [status, category, JSON.stringify(sources || []), JSON.stringify(source_ids || []), text]
  );
  return rows[0];
}

export async function updateDraftStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE drafts SET status = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0] || null;
}

export async function updateDraftText(id, text) {
  const { rows } = await pool.query(
    `UPDATE drafts SET text = $1, status = 'edited', updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [text, id]
  );
  return rows[0] || null;
}

// ── GITHUB CACHE HELPERS ──────────────────────────────────────
export async function upsertGitHubUpdates(updates) {
  for (const u of updates) {
    await pool.query(
      `INSERT INTO github_updates
         (id, repo, label, category, sha, message, author, url, weight, committed_at, fetched_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW())
       ON CONFLICT (id) DO UPDATE SET fetched_at = NOW()`,
      [u.id, u.repo, u.label, u.category, u.sha, u.message, u.author, u.url, u.weight, u.committed_at]
    );
  }
}

export async function getGitHubUpdates() {
  const { rows } = await pool.query(
    "SELECT * FROM github_updates ORDER BY committed_at DESC LIMIT 50"
  );
  return rows;
}

export async function clearOldGitHubUpdates() {
  await pool.query(
    "DELETE FROM github_updates WHERE committed_at < NOW() - INTERVAL '7 days'"
  );
}

export default pool;
