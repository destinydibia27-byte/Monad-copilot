import "dotenv/config";
import express from "express";
import cors from "cors";
import cron from "node-cron";
import {
  initDB, getAllDrafts, insertDraft,
  updateDraftStatus, updateDraftText,
  upsertGitHubUpdates, getGitHubUpdates, clearOldGitHubUpdates,
} from "./database.js";

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS ──────────────────────────────────────────────────────
// Allows both local dev and your Vercel production URL
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
}));
app.use(express.json());

// ── GITHUB SOURCES ────────────────────────────────────────────
const GITHUB_SOURCES = [
  { repo: "category-labs/monad",              label: "monad-labs",    category: "Infrastructure",   weight: 8 },
  { repo: "category-labs/monad-bft",          label: "monad-labs",    category: "Infrastructure",   weight: 8 },
  { repo: "monad-developers/validator-info",  label: "monad-devs",    category: "Builder Activity", weight: 7 },
  { repo: "monad-developers/execution-specs", label: "monad-devs",    category: "Infrastructure",   weight: 7 },
  { repo: "Kuru-Labs/kuru-sdk",               label: "Kuru Exchange", category: "DeFi",             weight: 6 },
];

// ── GITHUB FETCH ──────────────────────────────────────────────
async function fetchAndCacheGitHub() {
  console.log("⟳ Fetching GitHub commits...");
  const results = [];
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  await Promise.all(
    GITHUB_SOURCES.map(async ({ repo, label, category, weight }, idx) => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo}/commits?per_page=3`,
          { headers }
        );
        if (!res.ok) return;
        const commits = await res.json();
        if (!Array.isArray(commits)) return;
        commits.forEach((c, i) => {
          results.push({
            id:           `gh-${idx}-${i}`,
            repo:         repo.split("/")[1],
            label,
            category,
            sha:          c.sha.slice(0, 7),
            message:      c.commit.message.split("\n")[0].slice(0, 120),
            author:       c.commit.author.name,
            url:          c.html_url,
            weight,
            committed_at: c.commit.author.date,
          });
        });
      } catch (e) {
        console.warn(`  ✗ Skipped ${repo}: ${e.message}`);
      }
    })
  );

  if (results.length > 0) {
    await upsertGitHubUpdates(results);
    await clearOldGitHubUpdates();
    console.log(`  ✓ Cached ${results.length} commits`);
  }
}

// ── ROUTES ────────────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/drafts", async (req, res) => {
  try { res.json(await getAllDrafts()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/drafts", async (req, res) => {
  try {
    const drafts  = Array.isArray(req.body) ? req.body : [req.body];
    const created = await Promise.all(drafts.map(d => insertDraft({
      status:     d.status     || "pending",
      category:   d.category   || "Ecosystem News",
      sources:    d.sources    || [],
      source_ids: d.source_ids || [],
      text:       d.text,
    })));
    res.status(201).json(created);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch("/drafts/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending","approved","rejected","edited"].includes(status))
      return res.status(400).json({ error: "Invalid status" });
    const draft = await updateDraftStatus(req.params.id, status);
    if (!draft) return res.status(404).json({ error: "Draft not found" });
    res.json(draft);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch("/drafts/:id/text", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });
    const draft = await updateDraftText(req.params.id, text);
    if (!draft) return res.status(404).json({ error: "Draft not found" });
    res.json(draft);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/github-updates", async (req, res) => {
  try { res.json(await getGitHubUpdates()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/github-updates/refresh", async (req, res) => {
  try {
    await fetchAndCacheGitHub();
    res.json({ ok: true, updates: await getGitHubUpdates() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/generate", async (req, res) => {
  try {
    const { context } = req.body;
    if (!context) return res.status(400).json({ error: "context is required" });
    if (!process.env.ANTHROPIC_API_KEY)
      return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are a Monad ecosystem content creator writing tweets for Crypto Twitter.
Style: concise, punchy, ecosystem-supportive, founder tone — not degen, not corporate.
Mix educational, hype, and builder-focused content. Occasionally technical but always digestible.
Feel deeply embedded in the Monad community. No financial advice. Use 🔺 or 🟣 sparingly.
Return ONLY a JSON array of 2 tweet objects, each with: { "text": "...", "category": "DeFi|Gaming|Infrastructure|Funding|Builder Activity|Community|Ecosystem News" }
No markdown. No explanation. Raw JSON only.`,
        messages: [{ role: "user", content: `Generate 2 tweet drafts about this Monad ecosystem update:\n\n${context}` }],
      }),
    });

    const data   = await aiRes.json();
    const raw    = data.content?.find(b => b.type === "text")?.text || "[]";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    res.json(parsed);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CRON — runs on Railway server (not Vercel) ─────────────────
cron.schedule("*/5 * * * *", fetchAndCacheGitHub);

// ── START ─────────────────────────────────────────────────────
async function start() {
  await initDB();
  await fetchAndCacheGitHub();
  app.listen(PORT, () => {
    console.log(`\n🚀 Backend running on port ${PORT}`);
    console.log(`   DB:            ${process.env.DATABASE_URL ? "✓ Supabase connected" : "✗ DATABASE_URL missing"}`);
    console.log(`   GitHub token:  ${process.env.GITHUB_TOKEN     ? "✓ set" : "✗ not set (60 req/hr limit)"}`);
    console.log(`   Anthropic key: ${process.env.ANTHROPIC_API_KEY ? "✓ set" : "✗ not set"}\n`);
  });
}

start().catch(err => {
  console.error("Failed to start:", err);
  process.exit(1);
});
