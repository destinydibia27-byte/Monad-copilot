import { useState, useEffect } from "react";
import { T, CATEGORIES, SOURCES, MOBILE } from "./constants/theme";
import { GITHUB_SOURCES } from "./constants/github";
import { useIsMobile } from "./hooks/useWindowWidth";
import { useDrafts } from "./hooks/useDrafts";
import { useGitHubUpdates } from "./hooks/useGitHubUpdates";
import { StatCard } from "./components/StatCard";
import { DraftCard } from "./components/DraftCard";
import { UpdateRow } from "./components/UpdateRow";
import { EditModal } from "./components/EditModal";
import { GenPanel } from "./components/GenPanel";
import { Toast, Dot, PillBtn, GeneratingBar, SrcChip } from "./components/UI";

export default function MonadCoPilot() {
  const isMobile = useIsMobile();
  const { signOut } = useClerk();

  const [activeTab,    setActiveTab]    = useState("drafts");
  const [filterCat,    setFilterCat]    = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [editingDraft, setEditingDraft] = useState(null);
  const [generating,   setGenerating]   = useState(false);
  const [showGenPanel, setShowGenPanel] = useState(false);
  const [toast,        setToast]        = useState(null);
  const [selectedIds,  setSelectedIds]  = useState([]);
  const [time,         setTime]         = useState(new Date());
  const [showProfile,  setShowProfile]  = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const { drafts, loading: draftsLoading, updateStatus, saveEdit, generate } = useDrafts(showToast);
  const { updates: allUpdates, loading: githubLoading, error: githubError } = useGitHubUpdates();

  const toggleSelect = id =>
    setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleGenerate = async (customInput) => {
    setGenerating(true);
    setShowGenPanel(false);
    const selected = allUpdates.filter(u => selectedIds.includes(u.id));
    const context = selected.length > 0
      ? selected.map(u => `[${u.source} · ${u.category}] ${u.text}`).join("\n")
      : customInput;
    const ok = await generate({ context, selectedIds, allUpdates });
    if (ok) { setSelectedIds([]); setActiveTab("drafts"); }
    setGenerating(false);
  };

  const filteredDrafts = drafts.filter(d => {
    if (filterCat    !== "All" && d.category !== filterCat)    return false;
    if (filterStatus !== "All" && d.status   !== filterStatus) return false;
    return true;
  });

  const counts = {
    pending:  drafts.filter(d => d.status === "pending").length,
    approved: drafts.filter(d => d.status === "approved").length,
    edited:   drafts.filter(d => d.status === "edited").length,
    rejected: drafts.filter(d => d.status === "rejected").length,
  };

  const highSignal = allUpdates.filter(u => u.weight >= 8).length;
  const dateStr = time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:ital,wght@0,400;0,450;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; }
        body { background: ${T.bg}; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        button { font-feature-settings: "cv11","ss01"; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border2}; border-radius: 2px; }
        textarea { resize: vertical; }
        textarea::placeholder { color: ${T.textDim}; font-family: 'Inter', sans-serif; font-size: 13.5px; }
        @keyframes cardSlideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastIn     { from { opacity: 0; transform: translateX(12px);  } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulseRing   { 0%,100% { box-shadow: 0 0 0 0px rgba(74,222,128,0.4); } 50% { box-shadow: 0 0 0 5px rgba(74,222,128,0); } }

        /* ── Stat grid ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }
        @media (min-width: 540px) { .stat-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 900px) { .stat-grid { grid-template-columns: repeat(6, 1fr); } }

        /* ── Header: mobile-first ── */
        .app-header {
          padding: 14px 0 12px;
          border-bottom: 1px solid ${T.border};
          margin-bottom: 20px;
          display: grid;
          grid-template-areas:
            "brand actions"
            "meta  meta";
          grid-template-columns: 1fr auto;
          gap: 8px 12px;
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
          font-size: 16px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }
        @media (min-width: 400px) { .header-title { font-size: 18px; } }
        @media (min-width: 700px)  { .header-title { font-size: 21px; white-space: nowrap; } }

        .header-meta {
          grid-area: meta;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          color: ${T.textDim};
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }
        @media (min-width: 700px) {
          .header-meta { justify-content: center; font-size: 9.5px; }
        }

        .header-actions {
          grid-area: actions;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Generate button */
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
          border-bottom: 1px solid ${T.border};
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

        /* Source chips */
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
          background: ${T.card};
          border: 1px solid ${T.border};
          border-radius: 6px;
        }

        /* Footer */
        .app-footer {
          border-top: 1px solid ${T.border};
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

          {/* Brand: logo + title + v1 badge */}
          <div className="header-brand">
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: `linear-gradient(135deg, ${T.purple} 0%, ${T.purpleD} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
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

          {/* Meta: date + time — spans full width on mobile, center column on desktop */}
          <div className="header-meta">
            <span>ECOSYSTEM</span>
            <span style={{ color: T.border2 }}>·</span>
            <span>{dateStr}</span>
            <span style={{ color: T.border2 }}>·</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{timeStr}</span>
          </div>

          {/* Actions: profile dropdown + generate */}
          <div className="header-actions" style={{ position: "relative" }}>
            {generating && <Dot color={T.purple} pulse />}

            {/* Profile avatar button */}
            <button
              onClick={() => setShowProfile(p => !p)}
              style={{
                background: "none", border: `1px solid ${T.border2}`,
                borderRadius: "50%", padding: 0, cursor: "pointer",
                width: 32, height: 32, flexShrink: 0, overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.purple}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border2}
            >
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="avatar"
                  style={{ width: 32, height: 32, borderRadius: "50%", display: "block" }}
                />
              ) : (
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: T.purple }}>
                  {user?.email?.[0]?.toUpperCase() ?? "U"}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showProfile && (
              <>
                {/* Backdrop */}
                <div
                  onClick={() => setShowProfile(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 49 }}
                />
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  zIndex: 50, minWidth: 220,
                  background: "#13131a", border: `1px solid ${T.border}`,
                  borderRadius: 12, padding: "4px",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
                  animation: "cardSlideIn 0.15s ease",
                }}>
                  {/* User info */}
                  <div style={{
                    padding: "12px 14px 10px",
                    borderBottom: `1px solid ${T.border}`,
                    marginBottom: 4,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="avatar"
                          style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${T.border2}` }}
                        />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: `${T.purple}20`, border: `1px solid ${T.purple}40`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: T.purple,
                        }}>
                          {user?.email?.[0]?.toUpperCase() ?? "U"}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500,
                          color: T.text, letterSpacing: "-0.01em",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {user?.user_metadata?.full_name || user?.user_metadata?.name || "User"}
                        </div>
                        <div style={{
                          fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5,
                          color: T.textDim, letterSpacing: "0.02em", marginTop: 2,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {user?.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Provider badge */}
                  <div style={{ padding: "6px 14px 4px" }}>
                    <span style={{
                      fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.08em",
                      color: T.textDim, textTransform: "uppercase",
                    }}>
                      Signed in via {user?.app_metadata?.provider ?? "oauth"}
                    </span>
                  </div>

                  {/* Sign out */}
                  <button
                    onClick={() => { setShowProfile(false); signOut(); }}
                    style={{
                      width: "100%", background: "none",
                      border: "none", borderRadius: 8,
                      padding: "10px 14px", marginTop: 2,
                      display: "flex", alignItems: "center", gap: 10,
                      cursor: "pointer", transition: "background 0.12s",
                      fontFamily: "'Inter',sans-serif", fontSize: 13,
                      fontWeight: 450, color: "#f87171",
                      letterSpacing: "-0.01em", textAlign: "left",
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
                color: activeTab === tab.key ? "#fff" : T.textDim,
              }}
              onMouseEnter={e => { if (activeTab !== tab.key) e.currentTarget.style.color = T.textSub; }}
              onMouseLeave={e => { if (activeTab !== tab.key) e.currentTarget.style.color = T.textDim; }}
            >
              {tab.label}
              <span style={{
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 9,
                fontVariantNumeric: "tabular-nums",
                padding: "2px 6px", borderRadius: 3,
                background: activeTab === tab.key ? `${T.purple}20` : T.border,
                color: activeTab === tab.key ? T.purple : T.textDim,
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
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredDrafts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "56px 0", fontFamily: "'Inter',sans-serif", fontSize: 13, color: T.textDim, letterSpacing: "-0.01em" }}>
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
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: T.border2 }}>·</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: T.textDim, letterSpacing: "0.01em" }}>
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
                  Generate from {selectedIds.length} selected →
                </button>
              )}
            </div>

            {githubLoading && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", marginBottom: 12,
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: T.textDim, letterSpacing: "0.04em",
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
              }}>
                {githubError}
              </div>
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
                <span style={{ color: T.textDim, marginLeft: "auto" }}>refreshes every 5 min</span>
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
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: T.textDim, letterSpacing: "0.07em" }}>
            MONAD CT CO-PILOT · ECOSYSTEM INTELLIGENCE TERMINAL
          </span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {SOURCES.map(s => (
              <span key={s} style={{
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: T.textDim, letterSpacing: "0.02em",
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
