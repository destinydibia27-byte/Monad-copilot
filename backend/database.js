import pg from "pg";

const { Pool } = pg;

// ── CONNECTION ────────────────────────────────────────────────
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
      user_id     TEXT NOT NULL DEFAULT 'shared',
      status      TEXT NOT NULL DEFAULT 'pending',
      category    TEXT NOT NULL,
      sources     JSONB NOT NULL DEFAULT '[]',
      source_ids  JSONB NOT NULL DEFAULT '[]',
      text        TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Add user_id column if it doesn't exist (for existing deployments)
  await pool.query(`
    ALTER TABLE drafts ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'shared';
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
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
}

// ── DRAFT HELPERS ─────────────────────────────────────────────
export async function getAllDrafts(userId) {
  const { rows } = await pool.query(
    "SELECT * FROM drafts WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return rows;
}

export async function insertDraft({ user_id, status, category, sources, source_ids, text }) {
  const { rows } = await pool.query(
    `INSERT INTO drafts (user_id, status, category, sources, source_ids, text)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user_id, status, category, JSON.stringify(sources || []), JSON.stringify(source_ids || []), text]
  );
  return rows[0];
}

export async function updateDraftStatus(id, status, userId) {
  const { rows } = await pool.query(
    `UPDATE drafts SET status = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 RETURNING *`,
    [status, id, userId]
  );
  return rows[0] || null;
}

export async function updateDraftText(id, text, userId) {
  const { rows } = await pool.query(
    `UPDATE drafts SET text = $1, status = 'edited', updated_at = NOW()
     WHERE id = $2 AND user_id = $3 RETURNING *`,
    [text, id, userId]
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
