import { useState, useEffect } from "react";
import { T } from "../constants/theme";
import { useIsMobile } from "../hooks/useWindowWidth";
import { CatPill, StatusBadge, SrcChip, ActionBtn } from "./UI";

export function DraftCard({ draft, onApprove, onReject, onReset, onEdit, updates = [] }) {
  const isMobile = useIsMobile();
  const borderColor =
    draft.status === "approved" ? `${T.green}30` :
    draft.status === "rejected" ? `${T.red}20`   : T.border;

  const overLimit = draft.text.length > 280;
  const [highlight, setHighlight] = useState(draft.isNew || false);
  useEffect(() => {
    if (draft.isNew) {
      const t = setTimeout(() => setHighlight(false), 3000);
      return () => clearTimeout(t);
    }
  }, [draft.isNew]);

  const sources = draft.sources
    ? draft.sources
    : [...new Set(draft.source_ids.map(sid => {
        const u = updates.find(u => u.id === sid);
        return u ? u.source : null;
      }).filter(Boolean))];

  return (
    <div
      style={{
        background: highlight ? `${T.purple}12` : T.card, border: `1px solid ${highlight ? T.purple : borderColor}`,
        borderRadius: 10, padding: isMobile ? "16px 16px" : "20px 22px",
        opacity: draft.status === "rejected" ? 0.45 : 1,
        transition: "border-color 0.2s, opacity 0.2s",
        animation: draft.isNew ? "cardSlideIn 0.35s ease-out" : "none",
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={e => { if (draft.status !== "rejected") e.currentTarget.style.borderColor = draft.status === "approved" ? `${T.green}50` : `${T.purple}40`; }}
      onMouseLeave={e => e.currentTarget.style.borderColor = borderColor}
    >
      {draft.status === "approved" && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: T.green, borderRadius: "10px 0 0 10px" }} />
      )}

      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: isMobile ? 10 : 0 }}>
          <CatPill cat={draft.category} />
          <StatusBadge status={draft.status} />
          {draft.isNew && (
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: T.purpleL, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>● NEW</span>
          )}
          {!isMobile && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexShrink: 0 }}>
              {draft.status !== "approved" && draft.status !== "rejected" && (
                <>
                  <ActionBtn color={T.green}  onClick={onApprove} label="Approve" />
                  <ActionBtn color={T.red}    onClick={onReject}  label="Reject" />
                  <ActionBtn color={T.purple} onClick={onEdit}    label="Edit" />
                </>
              )}
              {(draft.status === "approved" || draft.status === "rejected") && (
                <ActionBtn color={T.textDim} onClick={onReset} label="Reset" />
              )}
            </div>
          )}
        </div>
        {isMobile && (
          <div style={{ display: "flex", gap: 6, width: "100%" }}>
            {draft.status !== "approved" && draft.status !== "rejected" && (
              <>
                <ActionBtn color={T.green}  onClick={onApprove} label="Approve" fullWidth />
                <ActionBtn color={T.red}    onClick={onReject}  label="Reject"  fullWidth />
                <ActionBtn color={T.purple} onClick={onEdit}    label="Edit"    fullWidth />
              </>
            )}
            {(draft.status === "approved" || draft.status === "rejected") && (
              <ActionBtn color={T.textDim} onClick={onReset} label="Reset" fullWidth />
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{
        fontFamily: "'Inter',sans-serif", fontSize: isMobile ? 13.5 : 14, lineHeight: 1.7,
        color: T.text, whiteSpace: "pre-wrap", fontWeight: 400, letterSpacing: "-0.01em",
      }}>{draft.text}</div>

      {/* Footer */}
      <div style={{
        marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", gap: 12 }}>
          {sources.map(source => <SrcChip key={source} source={source} />)}
        </div>
        <span style={{
          fontFamily: "'IBM Plex Mono',monospace", fontSize: 10,
          color: overLimit ? T.red : draft.text.length > 240 ? T.yellow : T.textDim,
          display: "flex", alignItems: "center", gap: 5,
          fontVariantNumeric: "tabular-nums", letterSpacing: "0.01em",
        }}>
          {overLimit && <span>⚠</span>}
          {draft.text.length}/280
          <span style={{ color: T.border2 }}>·</span>
          {Math.ceil(draft.text.split(" ").length / 3)}s read
        </span>
      </div>
      {draft.status === "approved" && (
 <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(draft.text)}`}
  target="_blank" rel="noopener noreferrer"
  onClick={e => {
    e.preventDefault();
    const text = encodeURIComponent(draft.text);
    window.location.href = `twitter://post?message=${text}`;
    setTimeout(() => {
      window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    }, 500);
  }}
  style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
    padding: "7px 14px", background: "#000", color: "#fff", borderRadius: 6,
    fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 500,
    textDecoration: "none" }}>
  𝕏 Post to X
</a>
)}	
    </div>
  );
}
