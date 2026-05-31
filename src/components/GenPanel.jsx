import { useState } from "react";
import { T } from "../constants/theme";
import { useIsMobile } from "../hooks/useWindowWidth";

export function GenPanel({ selectedCount, onGenerate, onCancel, generating }) {
  const isMobile = useIsMobile();
  const [input, setInput] = useState("");

  return (
    <div style={{
      background: T.card, border: `1px solid ${T.purple}40`,
      borderRadius: 12, padding: isMobile ? "18px 16px" : "22px 24px", marginBottom: 20,
      animation: "cardSlideIn 0.25s ease-out",
    }}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4, letterSpacing: "-0.02em" }}>
        Generate Tweet Drafts
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: T.textDim, letterSpacing: "0.06em", marginBottom: 16 }}>
        {selectedCount > 0
          ? `${selectedCount} SIGNAL(S) SELECTED AS CONTEXT — or add custom notes below`
          : "SELECT ECOSYSTEM SIGNALS BELOW · or describe a topic"}
      </div>
      <textarea
        placeholder="e.g. Monad just hit a new TPS record — write punchy founder-focused tweets…"
        value={input}
        onChange={e => setInput(e.target.value)}
        style={{
          width: "100%", background: T.surface,
          border: `1px solid ${T.border2}`, borderRadius: 8,
          color: T.text, fontFamily: "'Inter',sans-serif", fontSize: 13.5,
          lineHeight: 1.65, letterSpacing: "-0.01em",
          padding: "12px 14px", minHeight: isMobile ? 100 : 80,
          outline: "none", resize: "vertical",
        }}
      />
      <div style={{
        display: "flex", gap: 8, marginTop: 14,
        flexDirection: isMobile ? "column" : "row",
        justifyContent: isMobile ? "stretch" : "flex-end",
      }}>
        <button onClick={onCancel} style={{
          background: "transparent", border: `1px solid ${T.border}`,
          color: T.textDim, borderRadius: 7,
          padding: isMobile ? "12px 0" : "9px 16px",
          fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 450,
          letterSpacing: "-0.01em", cursor: "pointer",
          order: isMobile ? 2 : 0,
        }}>Cancel</button>
        <button
          onClick={() => onGenerate(input)}
          disabled={generating || (!input.trim() && selectedCount === 0)}
          style={{
            background: generating || (!input.trim() && selectedCount === 0) ? T.textDim : T.purple,
            border: "none", color: "#fff", borderRadius: 7,
            padding: isMobile ? "12px 0" : "9px 20px",
            fontFamily: "'Inter',sans-serif", fontSize: 12,
            fontWeight: 500, cursor: generating ? "not-allowed" : "pointer",
            letterSpacing: "-0.01em", transition: "opacity 0.15s",
            order: isMobile ? 1 : 0,
          }}
          onMouseEnter={e => { if (!generating) e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          {generating ? "Generating…" : "Generate 2 Drafts →"}
        </button>
      </div>
    </div>
  );
}
