import { useState } from "react";
import { T } from "../constants/theme";
import { useIsMobile } from "../hooks/useWindowWidth";
import { CatPill } from "./UI";

export function EditModal({ draft, onSave, onCancel }) {
  const isMobile = useIsMobile();
  const [text, setText] = useState(draft.text);
  const overLimit = text.length > 280;
  const warnZone  = text.length > 240;

  return (
    <div style={{
      position: "fixed", inset: 0, padding: isMobile ? "16px" : "0", zIndex: 500,
      background: "rgba(11,11,15,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: isMobile ? "flex-end" : "center",
      justifyContent: "center", padding: isMobile ? 0 : 24,
    }}>
      <div style={{
        background: T.card, border: `1px solid ${T.purple}40`,
        borderRadius: isMobile ? "14px 14px 0 0" : 14,
        padding: isMobile ? "24px 20px 32px" : "28px 30px",
        width: "100%", maxWidth: isMobile ? "100%" : 600,
        boxShadow: `0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px ${T.purple}20`,
        animation: "cardSlideIn 0.25s ease-out",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Edit Draft</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: T.textDim, marginTop: 4, letterSpacing: "0.06em" }}>
              MODERATION · CONTENT PIPELINE
            </div>
          </div>
          <CatPill cat={draft.category} />
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
          style={{
            width: "100%", background: T.surface,
            border: `1px solid ${overLimit ? T.red : T.border2}`,
            borderRadius: 8, color: T.text,
            fontFamily: "'Inter',sans-serif", fontSize: 14, lineHeight: 1.7,
            letterSpacing: "-0.01em",
            padding: "14px 16px", minHeight: 160, outline: "none", resize: "vertical",
            transition: "border-color 0.2s",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <span style={{
            fontFamily: "'IBM Plex Mono',monospace", fontSize: 10,
            color: overLimit ? T.red : warnZone ? T.yellow : T.textDim,
            fontVariantNumeric: "tabular-nums", letterSpacing: "0.01em",
          }}>
            {overLimit && "⚠ OVER LIMIT · "}{text.length} / 280
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onCancel} style={{
              background: "transparent", border: `1px solid ${T.border}`,
              color: T.textDim, borderRadius: 7, padding: "8px 16px",
              fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 450,
              letterSpacing: "-0.01em", cursor: "pointer",
            }}>Cancel</button>
            <button onClick={() => onSave(text)} style={{
              background: T.purple, border: "none", color: "#fff",
              borderRadius: 7, padding: "8px 18px",
              fontFamily: "'Inter',sans-serif", fontSize: 12,
              fontWeight: 500, letterSpacing: "-0.01em", cursor: "pointer",
              transition: "opacity 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >Save Changes →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
