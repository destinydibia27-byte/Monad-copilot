import { useState, useEffect } from "react";
import { fetchGitHubUpdates } from "../api/client";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return diff + "s ago";
  if (diff < 3600)  return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

function mapToUpdate(u) {
  return {
    id:           u.id,
    source:       "GitHub",
    category:     u.category,
    time:         timeAgo(u.committed_at),
    text:         `[${u.label}] ${u.repo} · ${u.sha}\n${u.message}\n— ${u.author}`,
    weight:       u.weight,
    url:          u.url,
    projectLabel: u.label,
  };
}

export function useGitHubUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGitHubUpdates();
      setUpdates(data.map(mapToUpdate));
    } catch {
      setError("Could not reach backend server");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  return { updates, loading, error, refresh: load };
}
