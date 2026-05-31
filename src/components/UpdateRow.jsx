import { useState } from "react";
import { T } from "../constants/theme";
import { useIsMobile } from "../hooks/useWindowWidth";
import { SrcChip, CatPill, SignalBar } from "./UI";

export function UpdateRow({ update, selected, onToggle }) {
  const isMobile = useIsMobile();
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? `${T.purple}0C` : hov ? `${T.purple}07` : T.card,
        border: `1px solid ${selected ? `${T.purple}50` : hov ? T.border2 : T.border}`,
        borderRadius: 9, padding: isMobile ? "12px 14px" : "14px 18px",
        display: "grid",
        gridTemplateColumns: isMobile ? "22px 1fr" : "22px 1fr auto",
        gap: isMobile ? 12 : 14,
        alignItems: "start",
        cursor: "pointer", transition: "all 0.15s ease",
      }}
    >
      {/* Checkbox */}
      <div style={{
        width: 16, height: 16, borderRadius: 4, marginTop: 2,
        border: `1.5px solid ${selected ? T.purple : hov ? T.textDim : T.border2}`,
        background: selected ? T.purple : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.15s",
      }}>
        {selected && <span style={{ color: "#fff", fontSize: 9, fontWeight: 700, lineHeight: 1 }}>✓</span>}
      </div>

      {/* Content */}
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "center", flexWrap: "wrap" }}>
          <SrcChip source={update.source} />
          <CatPill cat={update.category} />
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: T.textDim, letterSpacing: "0.02em" }}>
            {update.time}
          </span>
        </div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: isMobile ? 13 : 13.5, color: T.text, lineHeight: 1.65, letterSpacing: "-0.01em" }}>
          {update.text}
        </div>
        {isMobile && (
          <div style={{ marginTop: 10 }}>
            <SignalBar weight={update.weight} />
          </div>
        )}
      </div>

      {/* Signal — desktop only */}
      {!isMobile && (
        <div style={{ paddingTop: 2, flexShrink: 0 }}>
          <SignalBar weight={update.weight} />
        </div>
      )}
    </div>
  );
}
