import { T } from "../constants/theme";

export function StatCard({ label, val, color, sub, onClick, active }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? `${color}0F` : T.card,
        border: `1px solid ${active ? `${color}60` : T.border}`,
        borderRadius: 10, padding: "18px 20px",
        position: "relative", overflow: "hidden",
        transition: "border-color 0.15s, background 0.15s, transform 0.1s",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        boxShadow: active ? `0 0 0 1px ${color}30, 0 4px 20px ${color}12` : "none",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}60`;
        if (onClick) e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = active ? `${color}60` : T.border;
        e.currentTarget.style.transform = "none";
      }}
    >
      <div style={{
        position: "absolute", top: 0, right: 0, width: 60, height: 60,
        background: `radial-gradient(circle at 80% 20%, ${color}${active ? "20" : "12"} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800,
        color, lineHeight: 1, marginBottom: 8,
        fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em",
      }}>{val}</div>
      <div style={{
        fontFamily: "'Inter',sans-serif", fontSize: 11.5, fontWeight: active ? 600 : 500,
        color: active ? color : T.textSub, letterSpacing: "-0.01em",
        transition: "color 0.15s",
      }}>{label}</div>
      {sub && (
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: `${color}70`, marginTop: 4, letterSpacing: "0.02em" }}>
          {sub}
        </div>
      )}
      {active && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          width: 6, height: 6, borderRadius: "50%",
          background: color, boxShadow: `0 0 0 3px ${color}30`,
        }} />
      )}
    </div>
  );
}
