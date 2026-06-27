import { useState, useEffect } from "react";
import { supabase } from "./main";
import { T, CATEGORIES, SOURCES } from "./constants/theme";
import { GITHUB_SOURCES } from "./constants/github";
import { useIsMobile } from "./hooks/useWindowWidth";
import { useDrafts } from "./hooks/useDrafts";
import { useGitHubUpdates } from "./hooks/useGitHubUpdates";
import { StatCard } from "./components/StatCard";
import { DraftCard } from "./components/DraftCard";
import { UpdateRow } from "./components/UpdateRow";
import { EditModal } from "./components/EditModal";
import { GenPanel } from "./components/GenPanel";
import { Toast, Dot, GeneratingBar, SrcChip } from "./components/UI";

export default function MonadCoPilot({ session }) {
  const isMobile  = useIsMobile();
  const user       = session?.user ?? null;

  // ── UI State ──────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState("drafts");
  const [filterStatus, setFilterStatus] = useState("All");
  const [editingDraft, setEditingDraft] = useState(null);
  const [generating,   setGenerating]   = useState(false);
  const [showGenPanel, setShowGenPanel] = useState(false);
  const [toast,        setToast]        = useState(null);
  const [selectedIds,  setSelectedIds]  = useState([]);
  const [time,         setTime]         = useState(new Date());
  const [showProfile,  setShowProfile]  = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const light = {
      bg:      "#F4F3FF",
      surface: "#EEEDF9",
      card:    "#FFFFFF",
      card2:   "#F8F7FF",
      border:  "#E0DEFA",
      border2: "#CCC9F5",
      text:    "#1A1840",
      textSub: "#4B4880",
      textDim: "#8885B0",
    };
    const dark = {
      bg:      "#0B0B0F",
      surface: "#0F0F15",
      card:    "#13131A",
      card2:   "#17171F",
      border:  "#1C1C28",
      border2: "#242435",
      text:    "#E4E2FF",
      textSub: "#9896B8",
      textDim: "#5C5A7A",
    };
    const colors = darkMode ? dark : light;
    Object.assign(T, colors);
    document.body.style.background = colors.bg;
  }, [darkMode]);

  // ── Clock ─────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Toast ─────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  // ── Data ─────────────────────────────────────────────────
  const { drafts, loading: draftsLoading, updateStatus, saveEdit, generate, scheduleReminder, cancelReminder } = useDrafts(showToast);
  const { updates: allUpdates, loading: githubLoading, error: githubError } = useGitHubUpdates();

  // ── Helpers ───────────────────────────────────────────────
  const toggleSelect = id =>
    setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleGenerate = async (customInput) => {
    setGenerating(true);
    setShowGenPanel(false);
    const selected = allUpdates.filter(u => selectedIds.includes(u.id));
    const context  = selected.length > 0
      ? selected.map(u => `[${u.source} · ${u.category}] ${u.text}`).join("\n")
      : customInput;
    const ok = await generate({ context, selectedIds, allUpdates });
    if (ok) { setSelectedIds([]); setActiveTab("drafts"); }
    setGenerating(false);
  };

  const filteredDrafts = drafts.filter(d => {
    if (filterStatus !== "All" && d.status !== filterStatus) return false;
    return true;
  });

  const counts = {
    pending:  drafts.filter(d => d.status === "pending").length,
    approved: drafts.filter(d => d.status === "approved").length,
    edited:   drafts.filter(d => d.status === "edited").length,
    rejected: drafts.filter(d => d.status === "rejected").length,
  };

  const highSignal = allUpdates.filter(u => u.weight >= 8).length;
  const dateStr    = time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeStr    = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  const avatarUrl  = user?.user_metadata?.avatar_url;
  const fullName   = user?.user_metadata?.full_name || user?.user_metadata?.name || "User";
  const email      = user?.email ?? "";
  const provider   = user?.app_metadata?.provider ?? "oauth";
  const initial    = email[0]?.toUpperCase() ?? "U";

  const theme = darkMode ? T : {
    ...T,
    bg:      "#F4F3FF",
    surface: "#EEEDF9",
    card:    "#FFFFFF",
    card2:   "#F8F7FF",
    border:  "#E0DEFA",
    border2: "#CCC9F5",
    text:    "#1A1840",
    textSub: "#4B4880",
    textDim: "#8885B0",
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:ital,wght@0,400;0,450;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; }
        body { background: theme.bg; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        button { font-feature-settings: "cv11","ss01"; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: theme.border2; border-radius: 2px; }
        textarea { resize: vertical; }
        textarea::placeholder { color: theme.textDim; font-family: 'Inter', sans-serif; font-size: 13.5px; }
        @keyframes cardSlideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastIn     { from { opacity: 0; transform: translateX(12px);  } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulseRing   { 0%,100% { box-shadow: 0 0 0 0px rgba(74,222,128,0.4); } 50% { box-shadow: 0 0 0 5px rgba(74,222,128,0); } }

        /* ── Stat grid: 2 → 3 → 6 cols ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }
        @media (min-width: 540px) { .stat-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 900px) { .stat-grid { grid-template-columns: repeat(6, 1fr); } }

        /* ── Header: stacked mobile, row desktop ── */
        .app-header {
          padding: 14px 0 12px;
          border-bottom: 1px solid theme.border;
          margin-bottom: 20px;
          display: grid;
          grid-template-areas:
            "brand actions"
            "meta  meta";
          grid-template-columns: 1fr auto;
          gap: 8px 10px;
          align-items: center;
        }
        @media (min-width: 700px) {
          .app-header {
            grid-template-areas: "brand meta actions";
            grid-template-columns: auto 1fr auto;
            padding: 20px 0 18px;
            margin-bottom: 28px;
            gap: 0 20px;
          }
        }

        .header-brand {
          grid-area: brand;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .header-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          color: theme.text;
          letter-spacing: -0.04em;
          line-height: 1.1;
          font-size: 16px;
        }
        @media (min-width: 400px) { .header-title { font-size: 18px; } }
        @media (min-width: 700px) { .header-title { font-size: 21px; } }

        .header-meta {
          grid-area: meta;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          color: theme.textDim;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }
        @media (min-width: 700px) { .header-meta { justify-content: center; font-size: 9.5px; } }

        .header-actions {
          grid-area: actions;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .gen-btn {
          background: ${T.purple};
          color: #fff;
          border: none;
          padding: 9px 13px;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: opacity 0.15s;
          box-shadow: 0 4px 16px ${T.purple}35;
          white-space: nowrap;
        }
        @media (min-width: 700px) { .gen-btn { padding: 10px 18px; font-size: 13px; } }
        .gen-btn:hover { opacity: 0.85; }

        /* Tabs */
        .tabs-row {
          display: flex;
          gap: 0;
          margin-bottom: 20px;
          border-bottom: 1px solid theme.border;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .tab-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          letter-spacing: -0.01em;
          padding: 10px 16px 11px;
          margin-bottom: -1px;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        /* Source bar */
        .source-bar {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          align-items: center;
        }
        .source-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: theme.card;
          border: 1px solid theme.border;
          border-radius: 6px;
        }

        /* Footer */
        .app-footer {
          border-top: 1px solid theme.border;
          margin-top: 40px;
          padding: 18px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 640px) {
          .app-footer {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-top: 56px;
          }
        }

        /* Profile dropdown */
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          z-index: 50;
          min-width: 220px;
          background: theme.card;
          border: 1px solid theme.border;
          border-radius: 12px;
          padding: 4px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          animation: cardSlideIn 0.15s ease;
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 55% 35% at 75% 8%, ${T.purple}0D 0%, transparent 65%),
          radial-gradient(ellipse 35% 25% at 15% 85%, ${T.blue}09 0%, transparent 55%)
        `,
      }} />

      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {editingDraft && (
        <EditModal
          draft={editingDraft}
          onSave={text => { saveEdit(editingDraft.id, text); setEditingDraft(null); }}
          onCancel={() => setEditingDraft(null)}
        />
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px" }}>

        {/* ── HEADER ── */}
        <header className="app-header">

          {/* Brand */}
          <div className="header-brand">
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: `linear-gradient(135deg, ${T.purple} 0%, ${T.purpleD} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              boxShadow: `0 0 0 1px ${T.purple}40, 0 4px 16px ${T.purple}30`,
            }}>▲</div>
            <div style={{ minWidth: 0 }}>
              <h1 className="header-title">Monad CT Co-Pilot</h1>
              <span style={{
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 8.5, fontWeight: 500,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: T.purple, border: `1px solid ${T.purple}40`,
                padding: "2px 5px", borderRadius: 4, display: "inline-block", marginTop: 3,
              }}>v1 MVP</span>
            </div>
          </div>

          {/* Meta */}
          <div className="header-meta">
            <span>ECOSYSTEM INTELLIGENCE</span>
            <span style={{ color: theme.border2 }}>·</span>
            <span>{dateStr}</span>
            <span style={{ color: theme.border2 }}>·</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{timeStr}</span>
          </div>

          {/* Actions */}
          <div className="header-actions">
            {generating && <Dot color={T.purple} pulse />}

            {/* Avatar button */}
            <button
              onClick={() => setShowProfile(p => !p)}
              style={{
                background: "none", border: `1px solid theme.border2`,
                borderRadius: "50%", padding: 0, cursor: "pointer",
                width: 32, height: 32, flexShrink: 0, overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.purple}
              onMouseLeave={e => e.currentTarget.style.borderColor = theme.border2}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: 32, height: 32, display: "block" }} />
                : <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: T.purple }}>{initial}</span>
              }
            </button>

            {/* Dropdown */}
            {showProfile && (
              <>
                <div onClick={() => setShowProfile(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
                <div className="profile-dropdown">
                  {/* User info */}
                  <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid theme.border`, marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {avatarUrl
                        ? <img src={avatarUrl} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid theme.border2` }} />
                        : <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: `${T.purple}20`, border: `1px solid ${T.purple}40`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: T.purple,
                          }}>{initial}</div>
                      }
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: theme.text,
                          letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{fullName}</div>
                        <div style={{
                          fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: theme.textDim,
                          letterSpacing: "0.02em", marginTop: 2,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Drafts summary */}
                  <div style={{
                    margin: "4px 4px 0",
                    padding: "10px 12px",
                    background: theme.bg,
                    borderRadius: 8,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px 10px",
                  }}>
                    {[
                      { label: "Pending",  val: counts.pending,  color: T.purple },
                      { label: "Approved", val: counts.approved, color: T.green  },
                      { label: "Edited",   val: counts.edited,   color: T.yellow },
                      { label: "Rejected", val: counts.rejected, color: T.red    },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{val}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: theme.textDim, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: theme.border, margin: "8px 4px 4px" }} />

                  {/* Dark mode toggle */}
                  <button
                    onClick={() => { setDarkMode(d => !d); }}
                    style={{
                      width: "100%", background: "none", border: "none", borderRadius: 8,
                      padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                      cursor: "pointer", transition: "background 0.12s",
                      fontFamily: "'Inter',sans-serif", fontSize: 13,
                      fontWeight: 450, color: darkMode ? theme.text : "#1a1a2e", letterSpacing: "-0.01em", textAlign: "left",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${T.purple}10`}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    {darkMode ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                      </svg>
                    )}
                    {darkMode ? "Light Mode" : "Dark Mode"}
                    <span style={{
                      marginLeft: "auto",
                      width: 32, height: 18, borderRadius: 9,
                      background: darkMode ? T.purple : theme.border2,
                      position: "relative", transition: "background 0.2s", flexShrink: 0,
                      display: "inline-block",
                    }}>
                      <span style={{
                        position: "absolute", top: 3, left: darkMode ? 17 : 3,
                        width: 12, height: 12, borderRadius: "50%",
                        background: "#fff", transition: "left 0.2s",
                      }} />
                    </span>
                  </button>

                  {/* Provider */}
                  <div style={{ padding: "2px 14px 6px" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.08em", color: theme.textDim, textTransform: "uppercase" }}>
                      Signed in via {provider}
                    </span>
                  </div>

                  <div style={{ height: 1, background: theme.border, margin: "0 4px 4px" }} />

                  {/* Sign out */}
                  <button
                    onClick={() => { setShowProfile(false); supabase.auth.signOut(); }}
                    style={{
                      width: "100%", background: "none", border: "none", borderRadius: 8,
                      padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                      cursor: "pointer", transition: "background 0.12s",
                      fontFamily: "'Inter',sans-serif", fontSize: 13,
                      fontWeight: 450, color: T.red, letterSpacing: "-0.01em", textAlign: "left",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </>
            )}

            <button className="gen-btn" onClick={() => setShowGenPanel(true)}>
              + Generate
            </button>
          </div>
        </header>

        {/* ── STAT CARDS ── */}
        <div className="stat-grid">
          {[
            { label: "Pending Review", val: counts.pending,         color: T.purple, sub: "awaiting action",   filter: "pending"  },
            { label: "Approved",       val: counts.approved,        color: T.green,  sub: "ready to post",     filter: "approved" },
            { label: "Edited",         val: counts.edited,          color: T.yellow, sub: "modified",          filter: "edited"   },
            { label: "Rejected",       val: counts.rejected,        color: T.red,    sub: "archived",          filter: "rejected" },
            { label: "High Signal",    val: highSignal,             color: T.orange, sub: ">=8/10 score",      filter: null       },
            { label: "Repos Watched",  val: GITHUB_SOURCES.length, color: T.blue,   sub: "monad-labs · kuru", filter: null       },
          ].map(({ label, val, color, sub, filter }) => (
            <StatCard
              key={label}
              label={label} val={val} color={color} sub={sub}
              active={filter ? filterStatus === filter : false}
              onClick={filter ? () => {
                setFilterStatus(prev => prev === filter ? "All" : filter);
                setActiveTab("drafts");
              } : undefined}
            />
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="tabs-row">
          {[
            { key: "drafts",  label: "Drafts",            count: drafts.length     },
            { key: "updates", label: "Ecosystem Signals", count: allUpdates.length },
          ].map(tab => (
            <button
              key={tab.key}
              className="tab-btn"
              onClick={() => setActiveTab(tab.key)}
              style={{
                fontWeight: activeTab === tab.key ? 500 : 400,
                borderBottomColor: activeTab === tab.key ? T.purple : "transparent",
                color: activeTab === tab.key ? "#fff" : theme.textDim,
              }}
              onMouseEnter={e => { if (activeTab !== tab.key) e.currentTarget.style.color = theme.textSub; }}
              onMouseLeave={e => { if (activeTab !== tab.key) e.currentTarget.style.color = theme.textDim; }}
            >
              {tab.label}
              <span style={{
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 9,
                fontVariantNumeric: "tabular-nums", padding: "2px 6px", borderRadius: 3,
                background: activeTab === tab.key ? `${T.purple}20` : theme.border,
                color: activeTab === tab.key ? T.purple : theme.textDim,
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ── DRAFTS TAB ── */}
        {activeTab === "drafts" && (
          <div>
            {showGenPanel && (
              <GenPanel
                selectedCount={selectedIds.length}
                onGenerate={handleGenerate}
                onCancel={() => setShowGenPanel(false)}
                generating={generating}
              />
            )}
            {generating && <GeneratingBar />}

            {/* Status filter pills */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {[
                { key: "All",      label: "All",      color: theme.textSub },
                { key: "pending",  label: "Pending",  color: T.purple      },
                { key: "approved", label: "Approved", color: T.green       },
                { key: "edited",   label: "Edited",   color: T.yellow      },
                { key: "rejected", label: "Rejected", color: T.red         },
              ].map(({ key, label, color }) => {
                const active = filterStatus === key;
                return (
                  <button
                    key={key}
                    onClick={() => setFilterStatus(key)}
                    style={{
                      background: active ? `${color}18` : "transparent",
                      border: `1px solid ${active ? color : theme.border}`,
                      color: active ? color : theme.textDim,
                      borderRadius: 6, padding: "5px 12px",
                      fontFamily: "'IBM Plex Mono',monospace", fontSize: 10,
                      fontWeight: active ? 500 : 400,
                      letterSpacing: "0.04em", textTransform: "uppercase",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = theme.border2; e.currentTarget.style.color = theme.textSub; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = theme.border;  e.currentTarget.style.color = theme.textDim; }}}
                  >
                    {label}
                    <span style={{
                      marginLeft: 6, fontVariantNumeric: "tabular-nums",
                      opacity: 0.7,
                    }}>
                      {key === "All" ? drafts.length : drafts.filter(d => d.status === key).length}
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredDrafts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "56px 0", fontFamily: "'Inter',sans-serif", fontSize: 13, color: theme.textDim, letterSpacing: "-0.01em" }}>
                  {draftsLoading ? "Loading drafts..." : "No drafts match current filters"}
                </div>
              ) : filteredDrafts.map(d => (
                <DraftCard
                  key={d.id}
                  draft={d}
                  updates={allUpdates}
                  onApprove={() => updateStatus(d.id, "approved")}
                  onReject={()  => updateStatus(d.id, "rejected")}
                  onReset={()   => updateStatus(d.id, "pending")}
                  onEdit={()    => setEditingDraft(d)}
                  onSchedule={t => scheduleReminder(d.id, t)}
                  onCancelSchedule={() => cancelReminder(d.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── UPDATES TAB ── */}
        {activeTab === "updates" && (
          <div>
            {showGenPanel && (
              <GenPanel
                selectedCount={selectedIds.length}
                onGenerate={handleGenerate}
                onCancel={() => { setShowGenPanel(false); setSelectedIds([]); }}
                generating={generating}
              />
            )}

            <div className="source-bar">
              {SOURCES.map(s => (
                <div key={s} className="source-chip">
                  <SrcChip source={s} />
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: theme.border2 }}>·</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: theme.textDim, letterSpacing: "0.01em" }}>
                    {allUpdates.filter(u => u.source === s).length} updates
                  </span>
                </div>
              ))}
              {selectedIds.length > 0 && (
                <button
                  onClick={() => setShowGenPanel(true)}
                  style={{
                    marginLeft: isMobile ? 0 : "auto",
                    width: isMobile ? "100%" : "auto",
                    background: T.purple, border: "none", color: "#fff",
                    borderRadius: 7, padding: "9px 16px",
                    fontFamily: "'Inter',sans-serif", fontSize: 13,
                    fontWeight: 500, cursor: "pointer", letterSpacing: "-0.01em",
                    boxShadow: `0 4px 16px ${T.purple}30`, transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  Generate from {selectedIds.length} selected
                </button>
              )}
            </div>

            {githubLoading && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", marginBottom: 12,
                background: theme.card, border: `1px solid theme.border`, borderRadius: 8,
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: theme.textDim, letterSpacing: "0.04em",
              }}>
                <Dot color={T.purple} pulse />
                Fetching live GitHub commits...
              </div>
            )}
            {githubError && (
              <div style={{
                padding: "12px 16px", marginBottom: 12,
                background: `${T.red}10`, border: `1px solid ${T.red}30`, borderRadius: 8,
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: T.red, letterSpacing: "0.04em",
              }}>{githubError}</div>
            )}
            {!githubLoading && !githubError && allUpdates.length > 0 && (
              <div style={{
                padding: "10px 14px", marginBottom: 12,
                background: `${T.green}0C`, border: `1px solid ${T.green}25`, borderRadius: 8,
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.green,
                letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
              }}>
                <Dot color={T.green} pulse />
                {allUpdates.length} live commits from {[...new Set(GITHUB_SOURCES.map(s => s.label))].join(", ")}
                <span style={{ color: theme.textDim, marginLeft: "auto" }}>refreshes every 5 min</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {allUpdates.map(u => (
                <UpdateRow
                  key={u.id}
                  update={u}
                  selected={selectedIds.includes(u.id)}
                  onToggle={() => toggleSelect(u.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer className="app-footer">
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: theme.textDim, letterSpacing: "0.07em" }}>
            MONAD CT CO-PILOT · ECOSYSTEM INTELLIGENCE TERMINAL
          </span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {SOURCES.map(s => (
              <span key={s} style={{
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: theme.textDim, letterSpacing: "0.02em",
              }}>
                <SrcChip source={s} />
                <Dot color={T.green} pulse />
              </span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
