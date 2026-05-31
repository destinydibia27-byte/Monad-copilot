// In development: calls localhost:3001
// In production (Vercel): calls your Railway backend URL via VITE_API_URL env var
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fetchDrafts() {
  const res = await fetch(`${BASE}/drafts`);
  if (!res.ok) throw new Error("Failed to fetch drafts");
  return res.json();
}

export async function createDrafts(drafts) {
  const res = await fetch(`${BASE}/drafts`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(drafts),
  });
  if (!res.ok) throw new Error("Failed to create drafts");
  return res.json();
}

export async function patchDraftStatus(id, status) {
  const res = await fetch(`${BASE}/drafts/${id}/status`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function patchDraftText(id, text) {
  const res = await fetch(`${BASE}/drafts/${id}/text`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to update text");
  return res.json();
}

export async function fetchGitHubUpdates() {
  const res = await fetch(`${BASE}/github-updates`);
  if (!res.ok) throw new Error("Failed to fetch GitHub updates");
  return res.json();
}

export async function generateDrafts(context) {
  const res = await fetch(`${BASE}/generate`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ context }),
  });
  if (!res.ok) throw new Error("Generation failed");
  return res.json();
}
