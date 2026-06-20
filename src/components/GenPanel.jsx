import { useState } from "react";
import { T } from "../constants/theme";
import { useIsMobile } from "../hooks/useWindowWidth";

export function GenPanel({ selectedCount, onGenerate, onCancel, generating }) {
  const isMobile = useIsMobile();
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("github"); // "github" | "custom"

  const handleGenerate = () => {
    if (activeTab === "custom") {
      onGenerate(input, true); // pass flag so caller knows it's custom context
    } else {
      onGenerate(input);
    }
  };

  const canGenerate = activeTab === "github"
    ? (selectedCount > 0 || input.trim())
    : input.trim().length > 0;

  return (
    <div style={{
      background: T.card, border: `1px solid ${T.purple}40`,
      borderRadius: 12, padding: isMobile ? "18px 16px" : "22px 24px", marginBottom: 20,
      animation: "cardSlideIn 0.25s ease-out",
    }}>

      {/* Title */}
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4, letterSpacing: "-0.02em" }}>
        Generate Tweet Drafts
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: T.textDim, letterSpacing: "0.06em", marginBottom: 16 }}>
        AI-POWERED · MONAD ECOSYSTEM
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `1px solid ${T.border}` }}>
        {[
          { key: "github", label: "GitHub" },
          { key: "custom", label: "Custom Context" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: activeTab === tab.key ? 500 : 400,
              letterSpacing: "-0.01em", padding: "8px 16px 9px", marginBottom: -1,
              color: activeTab === tab.key ? "#fff" : T.textDim,
              borderBottom: activeTab === tab.key ? `2px solid ${T.purple}` : "2px solid transparent",
              transition: "color 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* GitHub Tab */}
      {activeTab === "github" && (
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: T.textDim, letterSpacing: "0.06em", marginBottom: 12 }}>
            {selectedCount > 0
              ? `${selectedCount} SIGNAL(S) SELECTED AS CONTEXT — or add custom notes below`
              : "SELECT ECOSYSTEM SIGNALS BELOW · or describe a topic"}
          </div>
          <textarea
            placeholder="e.g. Monad just hit a new TPS record — write punchy founder-focused tweets..."
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{
              width: "100%", background: T.surface,
              border: `1px solid ${T.border2}`, borderRadius: 8,
              color: T.text, fontFamily: "'Inter',sans-serif", fontSize: 13.5,
              lineHeight: 1.65, letterSpacing: "-0.01em",
              padding: "12px 14px", minHeight: isMobile ? 100 : 80,
              outline: "none", resize: "vertical", boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {/* Custom Context Tab */}
      {activeTab === "custom" && (
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: T.textDim, letterSpacing: "0.06em", marginBottom: 12 }}>
            PASTE ANYTHING — TWEET, ARTICLE, ANNOUNCEMENT, IDEA, DISCORD MESSAGE...
          </div>
          <textarea
            placeholder="e.g. Kuru just launched limit orders on Monad testnet. Volume hit $2M in the first hour..."
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{
              width: "100%", background: T.surface,
              border: `1px solid ${T.border2}`, borderRadius: 8,
              color: T.text, fontFamily: "'Inter',sans-serif", fontSize: 13.5,
              lineHeight: 1.65, letterSpacing: "-0.01em",
              padding: "12px 14px", minHeight: isMobile ? 120 : 100,
              outline: "none", resize: "vertical", boxSizing: "border-box",
            }}
          />
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: T.textDim, marginTop: 8, letterSpacing: "0.04em" }}>
            {input.length > 0 ? `${input.length} chars · AI will generate 2 tweet drafts from this` : "No GitHub signals needed — just your context"}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: "flex", gap: 8, marginTop: 14,
        flexDirection: isMobile ? "column" : "row",
        justifyContent: isMobile ? "stretch" : "flex-end",
      }}>
        <button
          onClick={onCancel}
          style={{
            background: "transparent", border: `1px solid ${T.border}`,
            color: T.textDim, borderRadius: 7,
            padding: isMobile ? "12px 0" : "9px 16px",
            fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 450,
            letterSpacing: "-0.01em", cursor: "pointer",
            order: isMobile ? 2 : 0,
          }}
        >Cancel</button>

        <button
          onClick={handleGenerate}
          disabled={generating || !canGenerate}
          style={{
            background: generating || !canGenerate ? T.textDim : T.purple,
            border: "none", color: "#fff", borderRadius: 7,
            padding: isMobile ? "12px 0" : "9px 20px",
            fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500,
            letterSpacing: "-0.01em", transition: "opacity 0.15s",
            cursor: generating || !canGenerate ? "not-allowed" : "pointer",
            order: isMobile ? 1 : 0,
          }}
          onMouseEnter={e => { if (!generating && canGenerate) e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          {generating ? "Generating..." : "Generate 2 Drafts →"}
        </button>
      </div>
    </div>
  );
}
