import { useState, useEffect } from "react";
import { fetchDrafts, createDrafts, patchDraftStatus, patchDraftText, generateDrafts } from "../api/client";

export function useDrafts(showToast) {
  const [drafts,  setDrafts]  = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from backend on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchDrafts();
        setDrafts(data);
      } catch {
        showToast("Could not load drafts from server", "error");
      }
      setLoading(false);
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    // Optimistic update
    setDrafts(ds => ds.map(d => d.id === id ? { ...d, status } : d));
    showToast(
      status === "approved" ? "Draft approved" : "Draft rejected",
      status === "rejected" ? "error" : "success"
    );
    try {
      await patchDraftStatus(id, status);
    } catch {
      showToast("Failed to save status to server", "error");
    }
  };

  const saveEdit = async (id, text) => {
    setDrafts(ds => ds.map(d => d.id === id ? { ...d, text, status: "edited" } : d));
    showToast("Draft updated");
    try {
      await patchDraftText(id, text);
    } catch {
      showToast("Failed to save edit to server", "error");
    }
  };

  const generate = async ({ context, selectedIds, allUpdates }) => {
    try {
      const parsed = await generateDrafts(context);
      if (!Array.isArray(parsed)) throw new Error(parsed.error || "Bad response");

      const selectedSources = [...new Set(
        allUpdates.filter(u => selectedIds.includes(u.id)).map(u => u.source)
      )];

      const draftsToSave = parsed.map(d => ({
        status:     "pending",
        category:   d.category || "Ecosystem News",
        source_ids: selectedIds,
        sources:    selectedSources.length > 0 ? selectedSources : ["GitHub"],
        text:       d.text,
      }));

      const newDrafts = await createDrafts(draftsToSave);
      setDrafts(ds => [...newDrafts.map(d => ({ ...d, isNew: true })), ...ds]);
      showToast(`${newDrafts.length} new drafts generated`);
      return true;
    } catch {
      showToast("Generation failed — is the backend running?", "error");
      return false;
    }
  };

  return { drafts, loading, updateStatus, saveEdit, generate };
}
