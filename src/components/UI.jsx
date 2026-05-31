import { useState } from "react";
import { T, CAT_COLORS } from "../constants/theme";
import { useIsMobile } from "../hooks/useWindowWidth";

export function StatusBadge({ status }) {
  const cfg = {
    pending:  { label: "Pending",  bg: `${T.purple}18`, color: T.purple },
    approved: { label: "Approved", bg: `${T.green}14`,  color: T.green  },
    rejected: { label: "Rejected", bg: `${T.red}14`,    color: T.red    },
    edited:   { label: "Edited",   bg: `${T.yellow}14`, color: T.yellow },
  }[status] || {};
  return (
    <span style={{
      fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, fontWeight: 500,
      letterSpacing: "0.08em", textTransform: "uppercase",
      padding: "2px 7px", borderRadius: 3,
      background: cfg.bg, color: cfg.color,
    }}>{cfg.label}</span>
  );
}

export function CatPill({ cat }) {
  const c = CAT_COLORS[cat] || T.purple;
  return (
    <span style={{
      fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, fontWeight: 500,
      letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "2px 8px", borderRadius: 3,
      background: `${c}14`, color: c, border: `1px solid ${c}28`,
    }}>{cat}</span>
  );
}

export function Dot({ color = T.green, pulse = false }) {
  return (
    <span style={{
      display: "inline-block", width: 6, height: 6, borderRadius: "50%",
      background: color,
      boxShadow: pulse ? `0 0 0 3px ${color}30` : "none",
      animation: pulse ? "pulseRing 2s ease-in-out infinite" : "none",
    }} />
  );
}

export function PillBtn({ active, color, onClick, children }) {
  const c = color || T.purple;
  return (
    <button onClick={onClick} style={{
      background: active ? `${c}1A` : "transparent",
      border: `1px solid ${active ? c : T.border}`,
      color: active ? c : T.textDim,
      borderRadius: 6, padding: "5px 13px",
      fontFamily: "'Inter',sans-serif", fontSize: 11.5,
      fontWeight: active ? 500 : 400, letterSpacing: "-0.01em", cursor: "pointer",
      transition: "all 0.15s ease", textTransform: "capitalize",
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = T.textSub; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = T.border;  e.currentTarget.style.color = T.textDim; } }}
    >{children}</button>
  );
}

export function ActionBtn({ color, onClick, label, fullWidth }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `${color}22` : `${color}10`,
        border: `1px solid ${color}35`,
        color, borderRadius: 6,
        padding: fullWidth ? "8px 0" : "5px 13px",
        flex: fullWidth ? "1 1 0" : "none",
        fontFamily: "'Inter',sans-serif", fontSize: 11.5,
        fontWeight: 500, letterSpacing: "-0.01em",
        cursor: "pointer", transition: "all 0.15s ease",
        transform: hov ? "translateY(-1px)" : "none",
        textAlign: "center",
      }}
    >{label}</button>
  );
}

// ── Platform Icons ────────────────────────────────────────────

function DiscordIcon({ size = 13, color = "#836EF9" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function TelegramIcon({ size = 13, color = "#60A5FA" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function GitHubIcon({ size = 13, color = "#9896B8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  );
}

const SOURCE_ICONS = {
  Discord:  (size, color) => <DiscordIcon  size={size} color={color} />,
  Telegram: (size, color) => <TelegramIcon size={size} color={color} />,
  GitHub:   (size, color) => <GitHubIcon   size={size} color={color} />,
};

export function SrcChip({ source }) {
  const colors = { Discord: T.purple, Telegram: T.blue, GitHub: T.textSub };
  const color = colors[source] || T.textDim;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5,
      fontWeight: 400, letterSpacing: "0.01em", color,
    }}>
      {SOURCE_ICONS[source]?.(13, color)}
      {source}
    </span>
  );
}

export function SignalBar({ weight }) {
  const high = weight >= 8;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontVariantNumeric: "tabular-nums" }}>
      <span style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} style={{
            width: 3, height: 8 + (i * 2), borderRadius: 1,
            background: i <= Math.round(weight / 2) ? (high ? T.green : T.purple) : T.border2,
            transition: "background 0.2s",
          }} />
        ))}
      </span>
      <span style={{ color: high ? T.green : T.textDim }}>{weight}/10</span>
    </span>
  );
}

export function Toast({ msg, type }) {
  const isMobile = useIsMobile();
  const isErr = type === "error";
  return (
    <div style={{
      position: "fixed",
      bottom: isMobile ? 16 : 28,
      right:  isMobile ? 16 : 28,
      left:   isMobile ? 16 : "auto",
      zIndex: 9999,
      background: isErr ? `${T.red}18` : `${T.green}14`,
      border: `1px solid ${isErr ? T.red : T.green}40`,
      color: isErr ? T.red : T.green,
      padding: "11px 18px", borderRadius: 8,
      fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 450,
      backdropFilter: "blur(16px)",
      animation: "toastIn 0.25s ease-out",
      display: "flex", alignItems: "center", gap: 9,
      letterSpacing: "-0.01em",
    }}>
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, fontWeight: 600 }}>{isErr ? "✕" : "✓"}</span>
      {msg}
    </div>
  );
}

export function GeneratingBar() {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  useState(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 12), 120);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 20px", background: T.card,
      border: `1px solid ${T.purple}30`, borderRadius: 8, marginBottom: 16,
    }}>
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            width: 2, height: 4 + Math.abs(Math.sin((i - step) * 0.8)) * 10,
            borderRadius: 1,
            background: Math.abs(i - step) < 2 ? T.purple : `${T.purple}30`,
            transition: "height 0.12s ease",
          }} />
        ))}
      </div>
      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500, color: T.purpleL, letterSpacing: "-0.01em" }}>
        Generating Drafts
      </span>
      {!isMobile && (
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.textDim, marginLeft: "auto", letterSpacing: "0.02em" }}>
          claude-sonnet-4 · ecosystem mode
        </span>
      )}
    </div>
  );
}
